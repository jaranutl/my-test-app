// src/components/orderlist/OrderListFilterBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { ORDER_STATUS_STEPS } from "@/lib/orderStatus";
import type { OrderListSearchParams } from "./searchParams";

type OrderListFilterBarProps = {
  searchParams: OrderListSearchParams;
};

type ChipKey = "deliveryDate" | "pickupMode" | "status";

const PICKUP_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "workin", label: "รับที่ร้าน" },
  { value: "delivery", label: "จัดส่ง" },
];

export const OrderListFilterBar = ({ searchParams }: OrderListFilterBarProps) => {
  const router = useRouter();
  const currentParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = (patch: Partial<OrderListSearchParams>) => {
    const next = new URLSearchParams(currentParams.toString());
    const merged: OrderListSearchParams = { ...searchParams, ...patch };

    (["q", "deliveryDate", "pickupMode", "status"] as const).forEach((key) => {
      const value = merged[key];
      if (value && value !== "all") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    next.delete("page");
    router.push(`/order_list?${next.toString()}`);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query !== (searchParams.q ?? "")) {
        pushParams({ q: query });
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const removeChip = (key: ChipKey) => {
    if (key === "deliveryDate") pushParams({ deliveryDate: undefined });
    if (key === "pickupMode") pushParams({ pickupMode: undefined });
    if (key === "status") pushParams({ status: undefined });
  };

  const chips: { key: ChipKey; label: string }[] = [];
  if (searchParams.deliveryDate) {
    chips.push({ key: "deliveryDate", label: `วันที่ ${searchParams.deliveryDate}` });
  }
  if (searchParams.pickupMode && searchParams.pickupMode !== "all") {
    chips.push({
      key: "pickupMode",
      label: PICKUP_OPTIONS.find((o) => o.value === searchParams.pickupMode)?.label ?? searchParams.pickupMode,
    });
  }
  if (searchParams.status && searchParams.status !== "all") {
    chips.push({
      key: "status",
      label:
        searchParams.status === "not_delivered"
          ? "ยังไม่สำเร็จ"
          : ORDER_STATUS_STEPS.find((s) => s.value === searchParams.status)?.label ?? searchParams.status,
    });
  }

  const hasActiveFilters =
    Boolean(searchParams.q) ||
    Boolean(searchParams.deliveryDate) ||
    (Boolean(searchParams.pickupMode) && searchParams.pickupMode !== "all") ||
    (Boolean(searchParams.status) && searchParams.status !== "all");

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#202a23]">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <Search size={16} className="text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า หรือเบอร์โทร"
            className="w-full bg-transparent text-sm outline-none dark:text-stone-100"
          />
        </label>

        <input
          type="date"
          value={searchParams.deliveryDate ?? ""}
          onChange={(e) => pushParams({ deliveryDate: e.target.value })}
          className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
        />

        <label className="group relative min-w-36">
          <span className="sr-only">รูปแบบการรับสินค้า</span>
          <select
            value={searchParams.pickupMode ?? "all"}
            onChange={(e) => pushParams({ pickupMode: e.target.value })}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-stone-700 shadow-sm outline-none transition hover:border-rose-200 hover:bg-rose-50/40 focus:border-[#d34f77] focus:ring-2 focus:ring-[#d34f77]/15 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-rose-300/30 dark:hover:bg-white/10 dark:focus:border-[#f3c95f] dark:focus:ring-[#f3c95f]/15"
          >
            {PICKUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition group-hover:text-[#d34f77] dark:group-hover:text-[#f3c95f]" />
        </label>

        <label className="group relative min-w-40">
          <span className="sr-only">สถานะคำสั่งซื้อ</span>
          <select
            value={searchParams.status ?? "all"}
            onChange={(e) => pushParams({ status: e.target.value })}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-stone-700 shadow-sm outline-none transition hover:border-rose-200 hover:bg-rose-50/40 focus:border-[#d34f77] focus:ring-2 focus:ring-[#d34f77]/15 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:border-rose-300/30 dark:hover:bg-white/10 dark:focus:border-[#f3c95f] dark:focus:ring-[#f3c95f]/15"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="not_delivered">ยังไม่สำเร็จ</option>
            {ORDER_STATUS_STEPS.map((step) => (
              <option key={step.value} value={step.value}>
                {step.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition group-hover:text-[#d34f77] dark:group-hover:text-[#f3c95f]" />
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push("/order_list");
            }}
            className="group flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-[#c8466c] shadow-sm transition hover:border-[#d34f77] hover:bg-[#d34f77] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d34f77]/35 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200 dark:hover:border-[#f3c95f] dark:hover:bg-[#f3c95f] dark:hover:text-[#17211b]"
          >
            <X size={15} strokeWidth={2.25} aria-hidden="true" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-[#d34f77] dark:bg-white/10 dark:text-rose-200"
            >
              {chip.label} <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
