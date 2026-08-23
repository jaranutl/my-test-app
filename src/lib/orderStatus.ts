export type OrderStatus =
  | "new"
  | "arranging"
  | "wrapping"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered";

export type OrderStatusStep = {
  value: OrderStatus;
  label: string;
  badgeClass: string;
};

export const ORDER_STATUS_STEPS: OrderStatusStep[] = [
  { value: "new", label: "รอดำเนินการ", badgeClass: "badge-neutral" },
  { value: "arranging", label: "จัดช่อ", badgeClass: "badge-info" },
  { value: "wrapping", label: "ห่อกระดาษ", badgeClass: "badge-warning" },
  { value: "ready_for_delivery", label: "เตรียมจัดส่ง", badgeClass: "badge-secondary" },
  { value: "out_for_delivery", label: "นัดรับ Grab แล้ว", badgeClass: "badge-accent" },
  { value: "delivered", label: "จัดส่งสำเร็จ", badgeClass: "badge-success" },
];

export const getStatusStep = (status: string | null | undefined) =>
  ORDER_STATUS_STEPS.find((step) => step.value === status);

export const getStatusLabel = (status: string | null | undefined) =>
  getStatusStep(status)?.label ?? status ?? "-";

export const getStatusIndex = (status: string | null | undefined) =>
  ORDER_STATUS_STEPS.findIndex((step) => step.value === status);
