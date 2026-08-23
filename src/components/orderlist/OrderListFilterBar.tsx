// src/components/orderlist/OrderListFilterBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
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

  // Keep the search box in sync when the URL changes from outside typing
  // (Back/Forward navigation, a chip removal, "ล้างตัวกรอง") — otherwise the
  // debounce effect above sees a stale local `query` and re-pushes the old
  // value right back onto the URL, fighting Back navigation.
  useEffect(() => {
    setQuery(searchParams.q ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.q]);

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
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
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
          className="input input-bordered input-sm dark:border-white/10 dark:bg-white/5"
        />

        <select
          value={searchParams.pickupMode ?? "all"}
          onChange={(e) => pushParams({ pickupMode: e.target.value })}
          className="select select-bordered select-sm dark:border-white/10 dark:bg-white/5"
        >
          {PICKUP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={searchParams.status ?? "all"}
          onChange={(e) => pushParams({ status: e.target.value })}
          className="select select-bordered select-sm dark:border-white/10 dark:bg-white/5"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="not_delivered">ยังไม่สำเร็จ</option>
          {ORDER_STATUS_STEPS.map((step) => (
            <option key={step.value} value={step.value}>
              {step.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push("/order_list");
            }}
            className="btn btn-sm btn-outline"
          >
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
