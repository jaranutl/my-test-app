// src/components/dashboard/StatusOverview.tsx
import { DASHBOARD_STATUS_BUCKETS, getDashboardStatusBucket } from "@/lib/dashboardStatus";
import { ORDER_STATUS_STEPS, type OrderStatus } from "@/lib/orderStatus";

type StatusOverviewProps = {
  counts: Record<OrderStatus, number>;
};

export const StatusOverview = ({ counts }: StatusOverviewProps) => {
  const bucketCounts: Record<string, number> = DASHBOARD_STATUS_BUCKETS.reduce(
    (acc, bucket) => ({ ...acc, [bucket.key]: 0 }),
    {},
  );

  let totalOrders = 0;
  for (const step of ORDER_STATUS_STEPS) {
    const bucket = getDashboardStatusBucket(step.value);
    const count = counts[step.value] ?? 0;
    bucketCounts[bucket] += count;
    totalOrders += count;
  }

  const doneCount = bucketCounts.done ?? 0;
  const inProgressCount = totalOrders - doneCount;
  const percentInProgress = totalOrders > 0 ? Math.round((inProgressCount / totalOrders) * 100) : 0;

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-300/20 dark:bg-[#4a2934]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#a14361] dark:text-rose-200">สถานะงาน</p>
          <p className="mt-1 text-3xl font-semibold text-stone-800 dark:text-rose-50">
            {inProgressCount} / {totalOrders}
          </p>
          <p className="text-xs text-stone-500 dark:text-rose-100/65">กำลังดำเนินการ</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#a14361] dark:bg-rose-200 dark:text-[#4a2934]">
          {percentInProgress}%
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {DASHBOARD_STATUS_BUCKETS.map((bucket) => (
          <div key={bucket.key} className="rounded-xl bg-white/70 p-3 dark:bg-white/10">
            <b className="text-stone-800 dark:text-rose-50">{bucketCounts[bucket.key]}</b>
            <p className="text-[10px] text-stone-500 dark:text-rose-100/65">{bucket.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
