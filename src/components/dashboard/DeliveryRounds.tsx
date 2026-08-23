// src/components/dashboard/DeliveryRounds.tsx
import { Clock3, Truck } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">รอบจัดส่ง</h3>
        <Truck size={16} className="text-[#cc5578] dark:text-rose-300" />
      </div>
      {sortedRounds.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">ไม่มีรอบจัดส่งในช่วงเวลานี้</p>
      ) : (
        sortedRounds.map(([time, count]) => (
          <div
            key={time}
            className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 dark:border-white/10"
          >
            <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#cc5578] dark:bg-rose-400/15 dark:text-rose-300">
              <Clock3 size={13} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{time} น.</p>
              <p className="text-xs text-stone-400">{count} ออเดอร์</p>
            </div>
          </div>
        ))
      )}
    </section>
  );
};
