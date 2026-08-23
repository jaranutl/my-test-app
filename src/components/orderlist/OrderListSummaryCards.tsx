import type { OrderRecord } from "./types";
import { getOrderTotal } from "./types";

type OrderListSummaryCardsProps = {
  orders: OrderRecord[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export const OrderListSummaryCards = ({ orders }: OrderListSummaryCardsProps) => {
  const deliveryCount = orders.filter((order) => order.pickup_mode === "delivery").length;
  const total = orders.reduce((sum, order) => sum + getOrderTotal(order).total, 0);

  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">คิวที่แสดง</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">
          {orders.length} <span className="text-sm font-normal text-stone-400">ออเดอร์</span>
        </p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">จัดส่ง</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">
          {deliveryCount} <span className="text-sm font-normal text-stone-400">รอบ</span>
        </p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">ยอดรวม</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</p>
      </div>
    </section>
  );
};
