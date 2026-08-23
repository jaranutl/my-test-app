import { Truck } from "lucide-react";
import type { DashboardOrderRow } from "./DashboardPage";

type DeliveryRoundsProps = {
  orders: DashboardOrderRow[];
};

export const DeliveryRounds = ({ orders }: DeliveryRoundsProps) => {
  const deliveryOrders = orders.filter((order) => order.pickup_mode === "delivery" && order.delivery_time);
  const rounds = new Map<string, number>();

  for (const order of deliveryOrders) {
    const time = order.delivery_time as string;
    rounds.set(time, (rounds.get(time) ?? 0) + 1);
  }

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <h3 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-100">รอบจัดส่ง</h3>
      {sortedRounds.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ไม่มีรอบจัดส่งในช่วงเวลานี้</p>
      ) : (
        <ul className="space-y-2">
          {sortedRounds.map(([time, count]) => (
            <li
              key={time}
              className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
                <Truck size={14} className="text-amber-700 dark:text-amber-300" /> {time} น.
              </span>
              <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                {count} ออเดอร์
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
