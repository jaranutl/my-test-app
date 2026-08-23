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

  const cards = [
    { label: "คิวที่แสดง", value: String(orders.length) },
    { label: "จัดส่ง", value: String(deliveryCount) },
    { label: "ยอดรวม", value: `${formatMoney(total)} บาท` },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]"
        >
          <div className="text-xs text-stone-500 dark:text-stone-400">{card.label}</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">{card.value}</div>
        </div>
      ))}
    </div>
  );
};
