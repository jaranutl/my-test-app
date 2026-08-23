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

  for (const step of ORDER_STATUS_STEPS) {
    const bucket = getDashboardStatusBucket(step.value);
    bucketCounts[bucket] += counts[step.value] ?? 0;
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <h3 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-100">สรุปสถานะ</h3>
      <div className="grid grid-cols-2 gap-3">
        {DASHBOARD_STATUS_BUCKETS.map((bucket) => (
          <div key={bucket.key} className="rounded-xl border border-stone-100 p-3 text-center dark:border-white/10">
            <span className={`badge ${bucket.badgeClass} text-white`}>{bucket.label}</span>
            <div className="mt-2 text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
              {bucketCounts[bucket.key]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
