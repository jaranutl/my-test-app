import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase environment variables");

const db = createClient(url, key);
const bucket = db.storage.from("order-images");
const segmentFor = (label) =>
  label === "รูปตัวอย่าง" ? "reference" : label === "รูปช่อที่จัดเสร็จแล้ว" ? "finished" : "delivered";

const { data: rows, error } = await db
  .from("attachments")
  .select("id,order_id,label,file_name,src,storage_path")
  .is("storage_path", null)
  .not("src", "is", null)
  .order("id");
if (error) {
  if (error.message.includes("storage_path")) {
    throw new Error("Apply supabase/order-images-storage-migration.sql before running the image backfill");
  }
  throw error;
}

console.log(`${apply ? "APPLY" : "DRY RUN"}: ${rows.length} attachment(s)`);
for (const row of rows) {
  if (!row.src?.startsWith("data:image/")) {
    console.log(`skip attachment=${row.id} reason=unsupported-src`);
    continue;
  }
  if (!apply) {
    console.log(`would-migrate attachment=${row.id} order=${row.order_id}`);
    continue;
  }

  const source = Buffer.from(row.src.slice(row.src.indexOf(",") + 1), "base64");
  const full = await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const thumb = await sharp(source).rotate().resize({ width: 320, height: 320, fit: "cover" }).webp({ quality: 72 }).toBuffer();
  const prefix = `${row.order_id}/${segmentFor(row.label)}/${randomUUID()}`;
  const storagePath = `${prefix}-full.webp`;
  const thumbnailPath = `${prefix}-thumb.webp`;

  const fullUpload = await bucket.upload(storagePath, full, { contentType: "image/webp" });
  if (fullUpload.error) throw fullUpload.error;
  const thumbUpload = await bucket.upload(thumbnailPath, thumb, { contentType: "image/webp" });
  if (thumbUpload.error) {
    await bucket.remove([storagePath]);
    throw thumbUpload.error;
  }
  const signed = await bucket.createSignedUrls([storagePath, thumbnailPath], 60);
  if (signed.error || signed.data?.some((item) => item.error || !item.signedUrl)) {
    await bucket.remove([storagePath, thumbnailPath]);
    throw signed.error || new Error(`Could not verify attachment ${row.id}`);
  }

  const update = await db.from("attachments").update({
    storage_path: storagePath,
    thumbnail_path: thumbnailPath,
    mime_type: "image/webp",
    size_bytes: full.length,
    uploader: "backfill",
    src: null,
  }).eq("id", row.id);
  if (update.error) {
    await bucket.remove([storagePath, thumbnailPath]);
    throw update.error;
  }
  console.log(`migrated attachment=${row.id} order=${row.order_id}`);
}
