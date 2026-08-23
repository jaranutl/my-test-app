import { Store, Truck } from "lucide-react";
import type { OrderRecord } from "./types";
import { OrderTimelineCard } from "./OrderTimelineCard";

type OrderListTimelineProps = {
  orders: OrderRecord[];
};

const UNSCHEDULED_KEY = "__unscheduled__";

const formatDateHeading = (value: string) => {
  // Construct from local date parts, not `new Date("YYYY-MM-DD")` — the
  // latter parses as UTC midnight and can render as the wrong day once
  // formatted in a timezone with a negative UTC offset.
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(year, month - 1, day),
  );
};

export const OrderListTimeline = ({ orders }: OrderListTimelineProps) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-sm text-stone-500 dark:text-stone-400">ไม่พบออเดอร์ที่ตรงกับตัวกรอง</p>
      </div>
    );
  }

  const groups = new Map<string, OrderRecord[]>();
  for (const order of orders) {
    const key = order.delivery_date ?? UNSCHEDULED_KEY;
    const list = groups.get(key) ?? [];
    list.push(order);
    groups.set(key, list);
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === UNSCHEDULED_KEY) return 1;
    if (b === UNSCHEDULED_KEY) return -1;
    return b.localeCompare(a);
  });

  return (
    <div className="space-y-6">
      {sortedKeys.map((key) => {
        const groupOrders = [...(groups.get(key) ?? [])].sort((a, b) => {
          if (!a.delivery_time) return 1;
          if (!b.delivery_time) return -1;
          return a.delivery_time.localeCompare(b.delivery_time);
        });

        return (
          <section key={key}>
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {key === UNSCHEDULED_KEY ? "ยังไม่ระบุวันนัด" : formatDateHeading(key)}
              </h3>
              <span className="text-xs text-stone-400">
                {groupOrders.length} รายการ
                {key !== UNSCHEDULED_KEY && " · เรียงตามเวลานัดรับ"}
              </span>
            </div>

            <ol className="relative space-y-3 border-l-2 border-stone-200 pl-5 dark:border-white/10">
              {groupOrders.map((order) => (
                <li key={order.id} className="relative">
                  <span
                    className={`absolute -left-[27px] top-3 grid size-5 place-items-center rounded-full ring-4 ring-[#faf9f7] dark:ring-[#121713] ${
                      order.pickup_mode === "delivery" ? "bg-amber-500" : "bg-[#dd5f83]"
                    }`}
                  >
                    {order.pickup_mode === "delivery" ? (
                      <Truck size={11} className="text-white" />
                    ) : (
                      <Store size={11} className="text-white" />
                    )}
                  </span>
                  <OrderTimelineCard order={order} />
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
};
