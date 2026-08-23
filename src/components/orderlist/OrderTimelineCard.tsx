"use client";

import { useEffect, useState } from "react";
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
  // This component is still server-rendered on first paint even though it's
  // "use client" — `now` starts null so the initial (server) HTML never shows
  // the badge, avoiding both a server-timezone-skewed value and a hydration
  // mismatch. It's filled in once mounted, using only the viewer's clock.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const isOverdue = Boolean(
    now &&
      order.delivery_date &&
      order.delivery_time &&
      order.status !== "delivered" &&
      new Date(`${order.delivery_date}T${order.delivery_time}`) < now,
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
      className="grid min-w-0 cursor-pointer grid-cols-1 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4 outline-none transition hover:border-rose-200 focus-visible:ring-2 focus-visible:ring-[#dd5f83] dark:border-white/8 dark:bg-white/5 md:grid-cols-[64px_72px_minmax(0,1fr)_105px_90px_120px_20px] md:items-center"
    >
      <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
        {order.delivery_time ? `${order.delivery_time} น.` : "-"}
        {isOverdue && (
          <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            เลยเวลา
          </span>
        )}
      </span>

      <b className="text-sm text-stone-800 dark:text-stone-100">#{order.order_no ?? order.id}</b>

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
          {order.customer?.line_name || "-"}
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

      <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
        {isDelivery ? <Truck size={14} /> : <Store size={14} />}
        {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
      </span>

      <b className="text-sm tabular-nums text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</b>

      {step && <span className={`badge ${step.badgeClass} w-full justify-center text-white`}>{step.label}</span>}

      <ChevronRight size={16} className="hidden text-stone-300 md:block dark:text-white/20" />
    </div>
  );
};
