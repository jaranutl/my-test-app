"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Store, Truck } from "lucide-react";
import { getStatusStep } from "@/lib/orderStatus";
import type { OrderRecord } from "./types";
import { getOrderTotal } from "./types";

type OrderTimelineCardProps = {
  order: OrderRecord;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export const OrderTimelineCard = ({ order }: OrderTimelineCardProps) => {
  const router = useRouter();
  const isDelivery = order.pickup_mode === "delivery";
  const step = getStatusStep(order.status);
  const { total } = getOrderTotal(order);
  const href = `/order_list/${order.id}`;
  // Computed client-side (this is a client component) so "overdue" reflects
  // the viewer's own clock/timezone, not the server's.
  const isOverdue = Boolean(
    order.delivery_date &&
      order.delivery_time &&
      order.status !== "delivered" &&
      new Date(`${order.delivery_date}T${order.delivery_time}`) < new Date(),
  );

  const openDetail = () => router.push(href);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="grid cursor-pointer grid-cols-1 gap-2 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-white/10 dark:bg-[#1a211c] sm:grid-cols-[64px_1fr_auto_auto_auto_20px] sm:items-center"
    >
      <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
        {order.delivery_time ? `${order.delivery_time} น.` : "-"}
        {isOverdue && (
          <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            เลยเวลา
          </span>
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
          #{order.order_no ?? order.id} · {order.customer?.line_name || "-"}
        </span>
        {order.customer?.phone ? (
          <a
            href={`tel:${order.customer.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-xs text-stone-500 hover:underline dark:text-stone-400"
          >
            {order.customer.phone}
          </a>
        ) : (
          <span className="block truncate text-xs text-stone-500 dark:text-stone-400">-</span>
        )}
      </span>

      <span className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
        {isDelivery ? <Truck size={13} /> : <Store size={13} />}
        {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
      </span>

      <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
        ฿{formatMoney(total)}
      </span>

      {step && <span className={`badge ${step.badgeClass} w-24 justify-center text-white`}>{step.label}</span>}

      <ChevronRight size={16} className="hidden text-stone-300 sm:block dark:text-white/20" />
    </div>
  );
};
