"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Store, Truck } from "lucide-react";
import { getStatusIndex, getStatusStep, ORDER_STATUS_STEPS } from "@/lib/orderStatus";
import type { OrderRecord } from "./types";
import { ATTACHMENT_LABELS, findAttachment, getOrderTotal } from "./types";

type OrderTimelineCardProps = {
  order: OrderRecord;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

const thumbnailFor = (order: OrderRecord) => {
  for (const label of [ATTACHMENT_LABELS.reference, ATTACHMENT_LABELS.finished, ATTACHMENT_LABELS.delivered]) {
    const attachment = findAttachment(order.attachments, label);
    const url = attachment?.thumbnail_url ?? attachment?.full_url ?? attachment?.src;
    if (url) return url;
  }
  return null;
};

export const OrderTimelineCard = ({ order }: OrderTimelineCardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDelivery = order.pickup_mode === "delivery";
  const step = getStatusStep(order.status);
  const stepIndex = Math.max(0, getStatusIndex(order.status));
  const { total } = getOrderTotal(order);
  const thumbnail = thumbnailFor(order);

  const openDetail = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("orderId", String(order.id));
    router.push(`/order_list?${next}`, { scroll: false });
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียดออเดอร์ ${order.order_no ?? order.id}`}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      className={`grid min-w-0 cursor-pointer gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4 outline-none transition hover:-translate-y-px hover:border-rose-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#dd5f83] dark:border-white/8 dark:bg-white/5 md:items-center ${
        thumbnail
          ? "md:grid-cols-[64px_72px_minmax(0,1fr)_105px_90px_150px_20px]"
          : "md:grid-cols-[72px_minmax(0,1fr)_105px_90px_150px_20px]"
      }`}
    >
      {thumbnail && (
        <div className="relative size-16 overflow-hidden rounded-xl bg-rose-50 dark:bg-white/8">
          <Image fill unoptimized src={thumbnail} alt="" className="object-cover" />
        </div>
      )}

      <b className="text-sm text-stone-800 dark:text-stone-100">#{order.order_no ?? order.id}</b>

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
          {order.customer?.line_name || "—"}
        </span>
        {order.customer?.phone ? (
          <a href={`tel:${order.customer.phone}`} onClick={(event) => event.stopPropagation()} className="block truncate text-xs text-stone-500 hover:underline dark:text-stone-400">
            {order.customer.phone}
          </a>
        ) : <span className="block text-xs text-stone-400">—</span>}
      </span>

      <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
        {isDelivery ? <Truck size={14} /> : <Store size={14} />}
        {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
      </span>

      <b className="text-sm tabular-nums text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</b>

      <div className="min-w-24">
        {step && (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${step.badgeClass}`}>
            {step.label}
          </span>
        )}
        <div className="mt-2 flex items-center" aria-label={`ความคืบหน้า ${stepIndex + 1} จาก ${ORDER_STATUS_STEPS.length}`}>
          {ORDER_STATUS_STEPS.map((status, index) => (
            <span key={status.value} className="flex flex-1 items-center last:flex-none">
              <span
                title={status.label}
                className={`size-2 shrink-0 rounded-full transition-all ${
                  index < stepIndex
                    ? "bg-[#dd5f83]"
                    : index === stepIndex
                      ? "scale-125 bg-[#dd5f83] ring-2 ring-rose-100 dark:ring-rose-400/15"
                      : "bg-stone-200 dark:bg-white/15"
                }`}
              />
              {index < ORDER_STATUS_STEPS.length - 1 && <span className={`h-px flex-1 ${index < stepIndex ? "bg-[#dd5f83]" : "bg-stone-200 dark:bg-white/15"}`} />}
            </span>
          ))}
        </div>
      </div>

      <ChevronRight size={16} className="hidden text-stone-300 md:block dark:text-white/20" />
    </article>
  );
};
