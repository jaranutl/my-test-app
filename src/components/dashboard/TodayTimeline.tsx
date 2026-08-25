// src/components/dashboard/TodayTimeline.tsx
import Link from "next/link";
import { ChevronRight, MapPin, Store, Truck } from "lucide-react";
import { getStatusStep } from "@/lib/orderStatus";
import { formatOrderTime } from "@/lib/orderPresentation";
import type { DashboardOrderRow } from "./DashboardPage";

type TodayTimelineProps = {
  orders: DashboardOrderRow[];
  viewAllHref: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getDeliveryPrice = (value: DashboardOrderRow["delivery_info"]) => {
  const record = Array.isArray(value) ? value[0] : value;
  return toNumber(record?.delivery_price);
};

export const TodayTimeline = ({ orders, viewAllHref }: TodayTimelineProps) => {
  const sorted = [...orders].sort((a, b) => {
    if (!a.delivery_time) return 1;
    if (!b.delivery_time) return -1;
    return a.delivery_time.localeCompare(b.delivery_time);
  });

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#202a23] sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">ลำดับงานวันนี้</h3>
          <p className="text-xs text-stone-400">Timeline ตามเวลานัดรับและจัดส่ง</p>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-[#cc5578] hover:underline dark:text-rose-300"
        >
          ดูทั้งหมด <ChevronRight size={15} />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
      ) : (
        <div className="relative before:absolute before:bottom-7 before:left-[57px] before:top-7 before:w-px before:bg-stone-200 dark:before:bg-white/15">
          <div className="mb-1 hidden grid-cols-[44px_14px_minmax(0,1fr)] gap-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:grid">
            <span className="text-right">เวลา</span>
            <span />
            <div className="grid grid-cols-[64px_minmax(90px,1fr)_minmax(110px,140px)_82px_112px_16px] gap-3 px-3">
              <span>ออเดอร์</span>
              <span>ลูกค้า</span>
              <span>สถานที่</span>
              <span>ยอด</span>
              <span>สถานะ</span>
              <span />
            </div>
          </div>

          {sorted.map((order) => {
            const isDelivery = order.pickup_mode === "delivery";
            const step = getStatusStep(order.status);
            const total = toNumber(order.bouquet_price) + (isDelivery ? getDeliveryPrice(order.delivery_info) : 0);
            const location = isDelivery ? "จัดส่ง" : "หน้าร้าน Sweet Pea & Co.";

            return (
              <Link
                key={order.id}
                href={`/order_list/${order.id}`}
                className="relative grid grid-cols-[44px_14px_minmax(0,1fr)] gap-3 py-2.5"
              >
                <b className="pt-3 text-right text-sm text-stone-700 dark:text-stone-200">
                  {formatOrderTime(order.delivery_time).replace(" น.", "")}
                </b>
                <span
                  aria-hidden="true"
                  className={`z-10 mt-[17px] size-3 rounded-full ring-4 ring-white dark:ring-[#202a23] ${
                    isDelivery ? "bg-amber-400" : "bg-[#dd5f83]"
                  }`}
                />
                <div className="grid min-h-16 min-w-0 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[64px_minmax(90px,1fr)_minmax(110px,140px)_82px_112px_16px] sm:items-center">
                  <b className="text-sm text-stone-800 dark:text-stone-100">#{order.order_no ?? order.id}</b>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                      {order.customer?.line_name || "-"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-stone-400">
                      {isDelivery ? <Truck size={12} /> : <Store size={12} />} {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
                    </p>
                  </div>
                  <span
                    title={location}
                    className="hidden min-w-0 items-center gap-1.5 text-sm text-stone-500 dark:text-stone-300 sm:flex"
                  >
                    <MapPin size={12} className="shrink-0 text-[#cc5578]" />
                    <span className="truncate">{location}</span>
                  </span>
                  <b className="text-sm tabular-nums text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</b>
                  {step && (
                    <span className={`w-full rounded-full px-2 py-1 text-center text-[11px] font-medium ${step.badgeClass}`}>
                      {step.label}
                    </span>
                  )}
                  <ChevronRight size={14} className="hidden text-stone-300 sm:block dark:text-white/20" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
