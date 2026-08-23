// src/components/dashboard/TodayTimeline.tsx
import Link from "next/link";
import { Store, Truck } from "lucide-react";
import { getStatusStep } from "@/lib/orderStatus";
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
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">คิววันนี้</h3>
        <Link href={viewAllHref} className="text-xs font-medium text-[#d34f77] hover:underline dark:text-rose-300">
          ดูทั้งหมด
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((order) => {
            const isDelivery = order.pickup_mode === "delivery";
            const step = getStatusStep(order.status);
            const total = toNumber(order.bouquet_price) + (isDelivery ? getDeliveryPrice(order.delivery_info) : 0);

            return (
              <li key={order.id}>
                <Link
                  href={`/order_list/${order.id}`}
                  className="grid grid-cols-[52px_28px_1fr_auto] items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-rose-100 hover:bg-rose-50/60 dark:hover:border-white/10 dark:hover:bg-white/5"
                >
                  <span className="text-xs font-medium tabular-nums text-stone-500 dark:text-stone-400">
                    {order.delivery_time ? `${order.delivery_time} น.` : "-"}
                  </span>
                  <span
                    className={`grid size-7 place-items-center rounded-full ${
                      isDelivery ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-[#d34f77]"
                    }`}
                  >
                    {isDelivery ? <Truck size={14} /> : <Store size={14} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                      #{order.order_no ?? order.id} · {order.customer?.line_name || "-"}
                    </span>
                    <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                      {isDelivery ? "จัดส่ง" : "หน้าร้าน SweetPea"} · ฿{formatMoney(total)}
                    </span>
                  </span>
                  {step && <span className={`badge ${step.badgeClass} shrink-0 text-white`}>{step.label}</span>}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
