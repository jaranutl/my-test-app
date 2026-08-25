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
  { value: "new", label: "รับออเดอร์แล้ว", badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-400/12 dark:text-sky-300" },
  { value: "arranging", label: "กำลังจัดช่อ", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-400/12 dark:text-amber-300" },
  { value: "wrapping", label: "กำลังห่อช่อ", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-400/12 dark:text-amber-300" },
  { value: "ready_for_delivery", label: "พร้อมรับ", badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300" },
  { value: "out_for_delivery", label: "กำลังจัดส่ง", badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-400/12 dark:text-sky-300" },
  { value: "delivered", label: "จัดส่งสำเร็จ", badgeClass: "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300" },
];

export const getStatusStep = (status: string | null | undefined) =>
  ORDER_STATUS_STEPS.find((step) => step.value === status);

export const getStatusLabel = (status: string | null | undefined) =>
  getStatusStep(status)?.label ?? status ?? "-";

export const getStatusIndex = (status: string | null | undefined) =>
  ORDER_STATUS_STEPS.findIndex((step) => step.value === status);
