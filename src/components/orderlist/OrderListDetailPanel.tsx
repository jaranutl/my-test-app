"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Camera, ExternalLink, ImageIcon, Printer, Upload, X } from "lucide-react";
import { ORDER_STATUS_STEPS, getStatusIndex, type OrderStatus } from "@/lib/orderStatus";
import { formatOrderTime } from "@/lib/orderPresentation";
import { updateOrderStatusInline, uploadOrderImageInline } from "@/app/order_list/actions";
import { ATTACHMENT_LABELS, findAttachment, getOrderTotal, type OrderRecord } from "./types";

type OrderListDetailPanelProps = { order: OrderRecord };

const imageUrl = (order: OrderRecord, label: string) => {
  const attachment = findAttachment(order.attachments, label);
  return attachment?.full_url ?? attachment?.src ?? null;
};

export const OrderListDetailPanel = ({ order }: OrderListDetailPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPhotoStatus, setPendingPhotoStatus] = useState<OrderStatus | null>(null);
  const [isPending, startTransition] = useTransition();
  const pickupMode = order.pickup_mode === "delivery" ? "delivery" : "workin";
  const visibleSteps = pickupMode === "delivery"
    ? ORDER_STATUS_STEPS
    : ORDER_STATUS_STEPS.filter((step) => step.value !== "out_for_delivery");
  const finishedImage = imageUrl(order, ATTACHMENT_LABELS.finished);
  const deliveredImage = imageUrl(order, ATTACHMENT_LABELS.delivered);
  const referenceImage = imageUrl(order, ATTACHMENT_LABELS.reference);
  const { total } = getOrderTotal(order);

  const close = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("orderId");
    router.push(next.size ? `/order_list?${next}` : "/order_list", { scroll: false });
  };

  const changeStatus = (status: OrderStatus) => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusInline(order.id, status);
      setMessage(result.ok ? "อัปเดตสถานะแล้ว" : result.error);
      if (result.ok) router.refresh();
    });
  };

  const upload = (label: string) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(null);
    startTransition(async () => {
      const result = await uploadOrderImageInline(order.id, label, new FormData(form));
      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      const shouldAdvance =
        (label === ATTACHMENT_LABELS.finished && pendingPhotoStatus === "ready_for_delivery") ||
        (label === ATTACHMENT_LABELS.delivered && pendingPhotoStatus === "delivered");
      const statusResult = shouldAdvance
        ? await updateOrderStatusInline(order.id, pendingPhotoStatus)
        : null;

      setMessage(statusResult && !statusResult.ok ? statusResult.error : shouldAdvance ? "บันทึกรูปและอัปเดตสถานะแล้ว" : "บันทึกรูปแล้ว");
      if (!statusResult || statusResult.ok) {
        setPendingPhotoStatus(null);
      }
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/35 backdrop-blur-[1px]" onClick={close}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-panel-title"
        onClick={(event) => event.stopPropagation()}
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#202a23] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-stone-400">ออเดอร์ #{order.order_no ?? order.id}</p>
            <h2 id="order-panel-title" className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">
              รายละเอียดและความคืบหน้า
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-300">
              {order.customer?.line_name || "—"} · {formatOrderTime(order.delivery_time)}
            </p>
          </div>
          <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full border border-stone-200 dark:border-white/10" aria-label="ปิด">
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/order_print/${order.id}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm dark:border-white/10">
            <Printer size={15} /> พิมพ์
          </Link>
          <Link href={`/order_list/${order.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm dark:border-white/10">
            <ExternalLink size={15} /> เปิดหน้าเต็ม
          </Link>
        </div>

        <section className="mt-6">
          <h3 className="text-sm font-semibold">รูปแบบช่อที่ลูกค้าต้องการ</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-[190px_1fr]">
            <div className="relative grid min-h-48 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 dark:from-rose-400/20 dark:via-white/5 dark:to-amber-300/10">
              {referenceImage ? (
                <Image fill unoptimized src={referenceImage} alt="รูปอ้างอิงลูกค้า" className="object-cover" />
              ) : (
                <div className="text-center" aria-label="ยังไม่มีรูปอ้างอิง">
                  <p className="text-6xl">💐</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] text-stone-500 dark:bg-black/20 dark:text-stone-300">
                    <ImageIcon size={11} /> รูปอ้างอิงลูกค้า
                  </span>
                </div>
              )}
            </div>
            <dl className="grid content-start gap-3 rounded-2xl border border-stone-200 p-4 text-sm dark:border-white/10">
              <div><dt className="text-stone-400">ดอกไม้</dt><dd className="mt-1 font-medium">{order.items?.map((item) => `${item.flowerType || "—"} ${item.flowerColor || ""} ×${item.quantity ?? 0}`).join(", ") || "—"}</dd></div>
              <div><dt className="text-stone-400">กระดาษ / โบว์</dt><dd className="mt-1 font-medium">{order.paper_color || "—"} / {order.bow_color || "—"}</dd></div>
              <div><dt className="text-stone-400">การรับสินค้า</dt><dd className="mt-1 font-medium">{pickupMode === "delivery" ? "จัดส่ง" : "รับที่ร้าน"} · {formatOrderTime(order.delivery_time)}</dd></div>
              <div><dt className="text-stone-400">ยอดรวม</dt><dd className="mt-1 font-semibold">฿{total.toLocaleString("th-TH")}</dd></div>
              {order.has_card && <div><dt className="text-stone-400">ข้อความการ์ด</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{order.card_message || "—"}</dd></div>}
            </dl>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 p-4 dark:border-white/10">
          <h3 className="text-sm font-semibold">ความคืบหน้า</h3>

          {(pendingPhotoStatus === "ready_for_delivery" || order.status === "ready_for_delivery") && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-300/20 dark:bg-rose-400/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">ถ่ายรูปช่อก่อนเปลี่ยนเป็นพร้อมรับ</p>
                  <p className="mt-1 text-xs text-stone-400">บันทึกรูปช่อที่จัดเสร็จแล้ว</p>
                </div>
                <Camera size={16} className="text-[#d34f77]" />
              </div>
              <form onSubmit={upload(ATTACHMENT_LABELS.finished)} className="mt-3">
                <label className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl text-center transition ${finishedImage ? "h-56 border border-emerald-200 bg-emerald-50 dark:border-emerald-300/20 dark:bg-emerald-400/10" : "min-h-32 border border-dashed border-rose-300 bg-rose-50/50 p-5 hover:bg-rose-50 dark:border-rose-300/30 dark:bg-rose-400/8"}`}>
                  {finishedImage ? (
                    <>
                      <Image fill unoptimized src={finishedImage} alt="รูปช่อที่จัดเสร็จแล้ว" className="object-cover" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">✓ บันทึกรูปช่อแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-[#d34f77]" />
                      <span className="mt-2 text-sm font-medium">ถ่ายรูปหรือเลือกรูปช่อดอกไม้</span>
                      <span className="mt-1 text-xs text-stone-400">JPG, PNG หรือ WEBP</span>
                    </>
                  )}
                  <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" disabled={isPending} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
                </label>
              </form>
            </div>
          )}

          {(pendingPhotoStatus === "delivered" || order.status === "delivered") && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-300/20 dark:bg-rose-400/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">ถ่ายรูปก่อนปิดงาน</p>
                  <p className="mt-1 text-xs text-stone-400">บันทึกหลักฐานการส่งมอบ</p>
                </div>
                <Camera size={16} className="text-[#d34f77]" />
              </div>
              <form onSubmit={upload(ATTACHMENT_LABELS.delivered)} className="mt-3">
                <label className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl text-center transition ${deliveredImage ? "h-56 border border-emerald-200 bg-emerald-50 dark:border-emerald-300/20 dark:bg-emerald-400/10" : "min-h-32 border border-dashed border-rose-300 bg-rose-50/50 p-5 hover:bg-rose-50 dark:border-rose-300/30 dark:bg-rose-400/8"}`}>
                  {deliveredImage ? (
                    <>
                      <Image fill unoptimized src={deliveredImage} alt="รูปส่งมอบ" className="object-cover" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">✓ บันทึกรูปส่งมอบแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-[#d34f77]" />
                      <span className="mt-2 text-sm font-medium">ถ่ายรูปหรือเลือกรูปส่งมอบ</span>
                      <span className="mt-1 text-xs text-stone-400">JPG, PNG หรือ WEBP</span>
                    </>
                  )}
                  <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" disabled={isPending} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
                </label>
              </form>
            </div>
          )}

          <h3 className="mt-6 text-sm font-semibold">อัปเดตความคืบหน้า</h3>
          <div className="mt-6 space-y-2">
            {visibleSteps.map((step, index) => {
              const active = order.status === step.value;
              const completed = getStatusIndex(order.status) > getStatusIndex(step.value);
              const needsPhoto =
                (step.value === "ready_for_delivery" && !finishedImage) ||
                (step.value === "delivered" && !deliveredImage);
              const disabled = isPending;

              return (
                <button
                  key={step.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (active) {
                      setPendingPhotoStatus(
                        step.value === "ready_for_delivery" || step.value === "delivered"
                          ? step.value
                          : null,
                      );
                      return;
                    }
                    if (needsPhoto) {
                      setPendingPhotoStatus(step.value);
                      setMessage(step.value === "delivered" ? "เพิ่มรูปส่งมอบเพื่ออัปเดตสถานะ" : "เพิ่มรูปช่อเพื่ออัปเดตสถานะ");
                      return;
                    }
                    changeStatus(step.value);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed ${
                    pendingPhotoStatus === step.value
                      ? "border-rose-300 bg-rose-50 dark:bg-rose-400/10"
                      : active
                      ? "border-[#dd5f83] bg-rose-50 text-[#b44767] dark:bg-rose-400/12 dark:text-rose-300"
                      : "border-stone-200 hover:border-rose-200 disabled:opacity-55 dark:border-white/10 dark:hover:border-rose-300/30"
                  }`}
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${completed || active ? "bg-[#dd5f83] text-white" : "bg-stone-100 text-stone-400 dark:bg-white/10"}`}>
                    {completed ? "✓" : index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{step.label}</span>
                  {active && <span className="text-xs">ปัจจุบัน</span>}
                  {needsPhoto && <Camera size={13} aria-label="เพิ่มรูปเพื่ออัปเดตสถานะ" />}
                </button>
              );
            })}
          </div>
          {message && <p aria-live="polite" className="mt-3 rounded-xl bg-stone-100 p-3 text-sm dark:bg-white/8">{message}</p>}
        </section>
      </aside>
    </div>
  );
};
