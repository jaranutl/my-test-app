import type { OrderStatus } from "./orderStatus.ts";

export type OrderPickupMode = "workin" | "delivery";

const DELIVERY_FLOW: OrderStatus[] = [
  "new",
  "arranging",
  "wrapping",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
];

const PICKUP_FLOW: OrderStatus[] = [
  "new",
  "arranging",
  "wrapping",
  "ready_for_delivery",
  "delivered",
];

export const getAllowedStatusTransitions = (
  current: OrderStatus,
  pickupMode: OrderPickupMode,
): OrderStatus[] => {
  const flow = pickupMode === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;
  const index = flow.indexOf(current);
  if (index < 0) return [];
  return [flow[index - 1], flow[index + 1]].filter((status): status is OrderStatus => Boolean(status));
};

export const validateStatusTransition = (
  current: OrderStatus,
  next: OrderStatus,
  pickupMode: OrderPickupMode,
) => getAllowedStatusTransitions(current, pickupMode).includes(next);
