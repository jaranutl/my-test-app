"use client";

import { useRouter } from "next/navigation";
import type { OrderListSearchParams } from "./searchParams";

type OrderListQuickFiltersProps = {
  searchParams: OrderListSearchParams;
};

const toTodayParam = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const OrderListQuickFilters = ({ searchParams }: OrderListQuickFiltersProps) => {
  const router = useRouter();
  const today = toTodayParam();

  const buildHref = (patch: Partial<OrderListSearchParams>) => {
    const merged: OrderListSearchParams = { ...searchParams, ...patch };
    const next = new URLSearchParams();
    if (merged.q) next.set("q", merged.q);
    if (merged.deliveryDate) next.set("deliveryDate", merged.deliveryDate);
    if (merged.pickupMode && merged.pickupMode !== "all") next.set("pickupMode", merged.pickupMode);
    if (merged.status && merged.status !== "all") next.set("status", merged.status);
    const query = next.toString();
    return query ? `/order_list?${query}` : "/order_list";
  };

  const isActive = {
    all:
      !searchParams.deliveryDate &&
      (!searchParams.pickupMode || searchParams.pickupMode === "all") &&
      (!searchParams.status || searchParams.status === "all"),
    today: searchParams.deliveryDate === today,
    workin: searchParams.pickupMode === "workin",
    delivery: searchParams.pickupMode === "delivery",
    notDelivered: searchParams.status === "not_delivered",
  };

  const filters: { key: keyof typeof isActive; label: string; href: string }[] = [
    { key: "all", label: "ทั้งหมด", href: "/order_list" },
    { key: "today", label: "วันนี้", href: buildHref({ deliveryDate: today }) },
    { key: "workin", label: "รับที่ร้าน", href: buildHref({ pickupMode: "workin" }) },
    { key: "delivery", label: "จัดส่ง", href: buildHref({ pickupMode: "delivery" }) },
    { key: "notDelivered", label: "ยังไม่สำเร็จ", href: buildHref({ status: "not_delivered" }) },
  ];

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => router.push(filter.href)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
            isActive[filter.key]
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "border border-stone-200 bg-white text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
