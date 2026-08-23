"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CirclePlus, Moon, Sun } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ORDER_STATUS_STEPS, type OrderStatus } from "@/lib/orderStatus";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DateRange } from "./DateRangeFilter";
import { FinancialSummary } from "./FinancialSummary";
import { StatusOverview } from "./StatusOverview";
import { TodayTimeline } from "./TodayTimeline";
import { DeliveryRounds } from "./DeliveryRounds";

export type DashboardOrderRow = {
  id: number;
  order_no: number | null;
  status: OrderStatus;
  bouquet_price: number | string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  pickup_mode: "workin" | "delivery" | null;
  customer: { line_name: string | null; phone: string | null } | null;
  delivery_info:
    | { delivery_price: number | string | null }[]
    | { delivery_price: number | string | null }
    | null;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const emptyCounts = (): Record<OrderStatus, number> =>
  ORDER_STATUS_STEPS.reduce(
    (acc, step) => ({ ...acc, [step.value]: 0 }),
    {} as Record<OrderStatus, number>,
  );

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getDeliveryPrice = (value: DashboardOrderRow["delivery_info"]) => {
  const record = Array.isArray(value) ? value[0] : value;
  return toNumber(record?.delivery_price);
};

const toDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DashboardPage = () => {
  const [range, setRange] = useState<DateRange>(() => ({
    start: startOfToday(),
    end: endOfToday(),
  }));
  const [orders, setOrders] = useState<DashboardOrderRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>(emptyCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      const supabase = supabaseBrowser();

      const { data, error } = await supabase
        .from("order")
        .select(
          "id, order_no, status, bouquet_price, delivery_date, delivery_time, pickup_mode, customer:customer_id(line_name, phone), delivery_info(delivery_price)",
        )
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString())
        .returns<DashboardOrderRow[]>();

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message);
        setOrders([]);
        setStatusCounts(emptyCounts());
        setIsLoading(false);
        return;
      }

      const counts = emptyCounts();
      for (const order of data ?? []) {
        counts[order.status] = (counts[order.status] ?? 0) + 1;
      }

      setOrders(data ?? []);
      setStatusCounts(counts);
      setIsLoading(false);
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [range, reloadToken]);

  const bouquetTotal = orders.reduce((sum, order) => sum + toNumber(order.bouquet_price), 0);
  const deliveryTotal = orders.reduce(
    (sum, order) => sum + (order.pickup_mode === "delivery" ? getDeliveryPrice(order.delivery_info) : 0),
    0,
  );
  const dateHref = `/order_list?deliveryDate=${toDateParam(range.start)}`;

  return (
    <div className={`dashboard-theme min-h-screen p-4 ${isDark ? "dark bg-[#121713]" : "bg-[#faf9f7]"}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">ภาพรวมคำสั่งซื้อ</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/8 dark:text-amber-300"
            aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <DateRangeFilter value={range} onChange={setRange} />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="mb-3">โหลดข้อมูลไม่สำเร็จ: {errorMessage}</p>
          <button type="button" onClick={() => setReloadToken((n) => n + 1)} className="btn btn-sm btn-outline">
            ลองใหม่
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#1a211c]">
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
          <Link
            href="/order_form"
            className="inline-flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มรายการใหม่
          </Link>
        </div>
      ) : (
        <>
          <FinancialSummary
            orderCount={orders.length}
            bouquetTotal={bouquetTotal}
            deliveryTotal={deliveryTotal}
            grandTotal={bouquetTotal + deliveryTotal}
            dateHref={dateHref}
          />

          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <TodayTimeline orders={orders} viewAllHref={dateHref} />
            <div className="grid gap-4">
              <StatusOverview counts={statusCounts} />
              <DeliveryRounds orders={orders} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
