import type { OrderStatus } from "./orderStatus";

export type DashboardStatusBucket = "received" | "arranging" | "ready" | "done";

export const DASHBOARD_STATUS_BUCKETS: {
  key: DashboardStatusBucket;
  label: string;
  badgeClass: string;
}[] = [
  { key: "received", label: "รับแล้ว", badgeClass: "badge-neutral" },
  { key: "arranging", label: "กำลังจัดช่อ", badgeClass: "badge-info" },
  { key: "ready", label: "พร้อมรับ", badgeClass: "badge-secondary" },
  { key: "done", label: "สำเร็จ", badgeClass: "badge-success" },
];

const BUCKET_BY_STATUS: Record<OrderStatus, DashboardStatusBucket> = {
  new: "received",
  arranging: "arranging",
  wrapping: "arranging",
  ready_for_delivery: "ready",
  out_for_delivery: "ready",
  delivered: "done",
};

export const getDashboardStatusBucket = (status: OrderStatus): DashboardStatusBucket =>
  BUCKET_BY_STATUS[status] ?? "received";
