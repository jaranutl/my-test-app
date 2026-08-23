"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { ATTACHMENT_LABELS, findAttachment } from "@/components/orderlist/types";
import type { AttachmentRecord } from "@/components/orderlist/types";
import type { OrderStatus } from "@/lib/orderStatus";

const detailPath = (orderId: number) => `/order_list/${orderId}`;

export async function updateOrderStatus(orderId: number, formData: FormData) {
  const nextStatus = formData.get("status") as OrderStatus;
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("order")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (!error) {
    await supabase
      .from("order_status_history")
      .insert({ order_id: orderId, status: nextStatus });
  }

  revalidatePath("/order_list");
  revalidatePath(detailPath(orderId));
  redirect(detailPath(orderId));
}

// formData is unused but required: bound server actions passed to a <form action>
// must accept it as the final parameter.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handoffToGrab(orderId: number, _formData: FormData) {
  const supabase = await supabaseServer();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("order")
    .update({ status: "out_for_delivery", grab_handoff_at: now })
    .eq("id", orderId);

  if (!error) {
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "out_for_delivery",
      note: "แจ้งเรียก Grab (manual handoff)",
    });
  }

  revalidatePath("/order_list");
  revalidatePath(detailPath(orderId));
  redirect(detailPath(orderId));
}

const upsertAttachment = async (orderId: number, label: string, file: File) => {
  const supabase = await supabaseServer();
  const buffer = Buffer.from(await file.arrayBuffer());
  const src = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;

  const { data: order } = await supabase
    .from("order")
    .select("attachments (id, label, file_name, src)")
    .eq("id", orderId)
    .single<{ attachments: AttachmentRecord[] }>();

  const existing = findAttachment(order?.attachments, label);

  if (existing?.id) {
    await supabase
      .from("attachments")
      .update({ file_name: file.name, src })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("attachments")
      .insert({ order_id: orderId, label, file_name: file.name, src });
  }
};

export async function uploadFinishedPhoto(orderId: number, formData: FormData) {
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    await upsertAttachment(orderId, ATTACHMENT_LABELS.finished, file);
    revalidatePath(detailPath(orderId));
  }

  redirect(detailPath(orderId));
}

export async function uploadDeliveredPhoto(orderId: number, formData: FormData) {
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    await upsertAttachment(orderId, ATTACHMENT_LABELS.delivered, file);

    const supabase = await supabaseServer();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("order")
      .update({ status: "delivered", delivered_at: now })
      .eq("id", orderId);

    if (!error) {
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: "delivered",
        note: "อัปโหลดรูปส่งมอบแล้ว",
      });
    }

    revalidatePath("/order_list");
    revalidatePath(detailPath(orderId));
  }

  redirect(detailPath(orderId));
}
