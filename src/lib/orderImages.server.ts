import "server-only";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { supabaseServer } from "@/lib/supabase/server";
import { validateOrderImage } from "@/lib/orderImageRules";
import type { AttachmentRecord } from "@/components/orderlist/types";

const BUCKET = "order-images";
const SIGNED_URL_TTL_SECONDS = 15 * 60;

const labelSegment = (label: string) =>
  label === "รูปตัวอย่าง" ? "reference" : label === "รูปช่อที่จัดเสร็จแล้ว" ? "finished" : "delivered";

const removePaths = async (paths: Array<string | null | undefined>) => {
  const cleanPaths = paths.filter((path): path is string => Boolean(path));
  if (cleanPaths.length === 0) return;
  const supabase = await supabaseServer();
  await supabase.storage.from(BUCKET).remove(cleanPaths);
};

const signedPathMap = async (
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  attachments: AttachmentRecord[] | null | undefined,
) => {
  const paths = Array.from(
    new Set((attachments ?? []).flatMap((attachment) => [attachment.storage_path, attachment.thumbnail_path]).filter((path): path is string => Boolean(path))),
  );
  if (paths.length === 0) return new Map<string, string>();
  const result = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  return new Map((result.data ?? []).flatMap((item) => item.signedUrl && item.path ? [[item.path, item.signedUrl]] : []));
};

const withSignedUrls = (attachments: AttachmentRecord[] | null | undefined, urls: Map<string, string>) =>
  (attachments ?? []).map((attachment) => {
    const fullUrl = attachment.storage_path ? urls.get(attachment.storage_path) : null;
    const thumbnailUrl = attachment.thumbnail_path ? urls.get(attachment.thumbnail_path) : null;
    return {
      ...attachment,
      full_url: fullUrl ?? attachment.src ?? null,
      thumbnail_url: thumbnailUrl ?? fullUrl ?? attachment.src ?? null,
    };
  });

export const signOrderAttachments = async (attachments: AttachmentRecord[] | null | undefined) => {
  const supabase = await supabaseServer();
  return withSignedUrls(attachments, await signedPathMap(supabase, attachments));
};

export const signOrderRecords = async <T extends { attachments: AttachmentRecord[] | null }>(orders: T[]) => {
  const supabase = await supabaseServer();
  const allAttachments = orders.flatMap((order) => order.attachments ?? []);
  const urls = await signedPathMap(supabase, allAttachments);
  return orders.map((order) => ({ ...order, attachments: withSignedUrls(order.attachments, urls) }));
};

export const storeOrderImage = async (
  orderId: number,
  label: string,
  file: File,
  uploader = "staff",
) => {
  const validationError = validateOrderImage(file);
  if (validationError) throw new Error(validationError);

  const source = Buffer.from(await file.arrayBuffer());
  const full = await sharp(source)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const thumbnail = await sharp(source)
    .rotate()
    .resize({ width: 320, height: 320, fit: "cover", position: "centre" })
    .webp({ quality: 72 })
    .toBuffer();

  const prefix = `${orderId}/${labelSegment(label)}/${randomUUID()}`;
  const storagePath = `${prefix}-full.webp`;
  const thumbnailPath = `${prefix}-thumb.webp`;
  const supabase = await supabaseServer();

  const fullUpload = await supabase.storage.from(BUCKET).upload(storagePath, full, { contentType: "image/webp" });
  if (fullUpload.error) throw new Error(`อัปโหลดรูปไม่สำเร็จ: ${fullUpload.error.message}`);

  const thumbnailUpload = await supabase.storage
    .from(BUCKET)
    .upload(thumbnailPath, thumbnail, { contentType: "image/webp" });
  if (thumbnailUpload.error) {
    await removePaths([storagePath]);
    throw new Error(`สร้างภาพย่อไม่สำเร็จ: ${thumbnailUpload.error.message}`);
  }

  const { data: existing } = await supabase
    .from("attachments")
    .select("id, storage_path, thumbnail_path")
    .eq("order_id", orderId)
    .eq("label", label)
    .maybeSingle<Pick<AttachmentRecord, "id" | "storage_path" | "thumbnail_path">>();

  const metadata = {
    order_id: orderId,
    label,
    file_name: file.name,
    src: null,
    storage_path: storagePath,
    thumbnail_path: thumbnailPath,
    mime_type: "image/webp",
    size_bytes: full.length,
    uploader,
  };
  const result = existing?.id
    ? await supabase.from("attachments").update(metadata).eq("id", existing.id).select("*").single()
    : await supabase.from("attachments").insert(metadata).select("*").single();

  if (result.error) {
    await removePaths([storagePath, thumbnailPath]);
    throw new Error(`บันทึกข้อมูลรูปไม่สำเร็จ: ${result.error.message}`);
  }

  await removePaths([existing?.storage_path, existing?.thumbnail_path]);
  return result.data as AttachmentRecord;
};

export const deleteOrderImage = async (orderId: number, label: string) => {
  const supabase = await supabaseServer();
  const { data: existing, error: readError } = await supabase
    .from("attachments")
    .select("id, storage_path, thumbnail_path")
    .eq("order_id", orderId)
    .eq("label", label)
    .maybeSingle<Pick<AttachmentRecord, "id" | "storage_path" | "thumbnail_path">>();
  if (readError) throw new Error(readError.message);
  if (!existing?.id) return;

  const { error: deleteError } = await supabase.from("attachments").delete().eq("id", existing.id);
  if (deleteError) throw new Error(deleteError.message);
  await removePaths([existing.storage_path, existing.thumbnail_path]);
};
