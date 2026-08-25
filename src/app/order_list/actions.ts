"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteOrderImage, storeOrderImage } from "@/lib/orderImages.server";
import { ATTACHMENT_LABELS } from "@/components/orderlist/types";
import { ORDER_STATUS_STEPS, type OrderStatus } from "@/lib/orderStatus";
import type { PickupMode } from "@/components/formorder/types";

export type OrderActionResult = { ok: true } | { ok: false; error: string };

const detailPath = (orderId: number) => `/order_list/${orderId}`;

const refreshOrderPaths = (orderId: number) => {
  revalidatePath("/order_list");
  revalidatePath(detailPath(orderId));
};

export async function updateOrderStatusInline(
  orderId: number,
  nextStatus: OrderStatus,
): Promise<OrderActionResult> {
  const supabase = await supabaseServer();
  const { data: order, error: readError } = await supabase
    .from("order")
    .select("status, pickup_mode, attachments(label)")
    .eq("id", orderId)
    .single<{
      status: OrderStatus;
      pickup_mode: PickupMode | null;
      attachments: { label: string | null }[];
    }>();

  if (readError || !order) return { ok: false, error: readError?.message ?? "ไม่พบออเดอร์" };
  const pickupMode = order.pickup_mode === "delivery" ? "delivery" : "workin";
  if (!ORDER_STATUS_STEPS.some((step) => step.value === nextStatus)) {
    return { ok: false, error: "สถานะไม่ถูกต้อง" };
  }
  if (pickupMode === "workin" && nextStatus === "out_for_delivery") {
    return { ok: false, error: "ออเดอร์รับที่ร้านไม่สามารถเปลี่ยนเป็นกำลังจัดส่ง" };
  }

  const labels = new Set(order.attachments.map((attachment) => attachment.label));
  if (nextStatus === "ready_for_delivery" && !labels.has(ATTACHMENT_LABELS.finished)) {
    return { ok: false, error: "ต้องอัปโหลดรูปช่อที่จัดเสร็จแล้วก่อน" };
  }
  if (nextStatus === "delivered" && !labels.has(ATTACHMENT_LABELS.delivered)) {
    return { ok: false, error: "ต้องอัปโหลดรูปส่งมอบก่อน" };
  }

  const patch: { status: OrderStatus; grab_handoff_at?: string | null; delivered_at?: string | null } = {
    status: nextStatus,
  };
  const now = new Date().toISOString();
  if (nextStatus === "out_for_delivery") patch.grab_handoff_at = now;
  if (nextStatus === "delivered") patch.delivered_at = now;
  if (nextStatus !== "delivered" && order.status === "delivered") patch.delivered_at = null;
  if (["new", "arranging", "wrapping", "ready_for_delivery"].includes(nextStatus)) patch.grab_handoff_at = null;

  const { error: updateError } = await supabase.from("order").update(patch).eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  const { error: historyError } = await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: nextStatus,
    note: nextStatus === "out_for_delivery" ? "แจ้งเรียก Grab" : "อัปเดตจาก Order List",
  });
  if (historyError) return { ok: false, error: historyError.message };

  refreshOrderPaths(orderId);
  return { ok: true };
}

export async function uploadOrderImageInline(
  orderId: number,
  label: string,
  formData: FormData,
): Promise<OrderActionResult> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "กรุณาเลือกรูปภาพ" };

  try {
    await storeOrderImage(orderId, label, file);
    refreshOrderPaths(orderId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ" };
  }
}

export async function deleteOrderImageInline(orderId: number, label: string): Promise<OrderActionResult> {
  try {
    await deleteOrderImage(orderId, label);
    refreshOrderPaths(orderId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "ลบรูปไม่สำเร็จ" };
  }
}

export async function updateOrderStatus(orderId: number, formData: FormData) {
  const nextStatus = formData.get("status") as OrderStatus;
  await updateOrderStatusInline(orderId, nextStatus);
  redirect(detailPath(orderId));
}

export async function handoffToGrab(orderId: number, _formData: FormData) {
  void _formData;
  await updateOrderStatusInline(orderId, "out_for_delivery");
  redirect(detailPath(orderId));
}

export async function uploadFinishedPhoto(orderId: number, formData: FormData) {
  await uploadOrderImageInline(orderId, ATTACHMENT_LABELS.finished, formData);
  redirect(detailPath(orderId));
}

export async function uploadDeliveredPhoto(orderId: number, formData: FormData) {
  const upload = await uploadOrderImageInline(orderId, ATTACHMENT_LABELS.delivered, formData);
  if (upload.ok) await updateOrderStatusInline(orderId, "delivered");
  redirect(detailPath(orderId));
}
