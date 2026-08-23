# Dashboard, Order List, and Order Print Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/dashboard` to match `docs/superpowers/ui/dashboard.md` (แบบ D — command-center hybrid), rebuild `/order_list` to match `docs/superpowers/ui/order-list.md` (แบบ D — date-grouped timeline + cards, server-side search/filter/pagination), and bring `/order_print/[orderId]` fully in line with `docs/superpowers/ui/order-print.md` by removing its duplicate type definitions.

**Architecture:** Three independent phases, each producing working software on its own — implement in any order. Phase A (Dashboard) stays a client component (existing architecture) that fetches an expanded row set per date range and derives split financial totals, a 4-bucket status overview, and delivery-time groupings from it. Phase B (Order List) converts the page into a fully server-driven list — search, filters, sort, and pagination all happen in the Supabase query, never in the browser — with a client-only filter bar and per-card click handler layered on top. Phase C (Order Print) is a small dedupe: the print route already implements nearly all of `order-print.md`; it just needs to stop duplicating `OrderRecord`/`ORDER_SELECT` and use the shared ones.

**Tech Stack:** Next.js App Router, React, Supabase (browser client for Phase A, server client for Phases B/C), Tailwind + daisyUI, lucide-react icons.

## Global Constraints

- `/order_list/[orderId]` (order-detail workspace) is **already implemented** in a prior session and matches `docs/superpowers/ui/order-detail.md` — it is out of scope here and must not be touched except where a shared type (`OrderRecord`, `ORDER_SELECT`) changes underneath it; if a task modifies those, re-run `npx tsc --noEmit` to confirm the detail workspace still compiles.
- This repo has no automated test runner. Validation is `npx tsc --noEmit --pretty false`, `git diff --check`, `npm run lint`, and the manual QA steps spelled out per phase — per project CLAUDE.md.
- `ORDER_STATUS_STEPS` (`src/lib/orderStatus.ts`) is the single source of truth for status labels/order everywhere (per `docs/superpowers/ui/README.md`) — never hardcode a parallel status list.
- Reuse the existing per-page dark-mode toggle pattern already used on `/order_form` (local `isDark` state toggling `document.documentElement.classList`, plus `dark:` Tailwind utility classes on every new element) — do not build a new theming mechanism; that is separately tracked in `2026-08-23-nav-and-perf-redesign-design.md` and not part of this plan.
- Money values are always split as `bouquet` (from `order.bouquet_price`) and `deliveryFee` (from `delivery_info.delivery_price`, only when `pickup_mode === "delivery"`) — never add delivery fee for a pickup order.
- Keep changes scoped to the three pages named above. Do not touch `/order_form`, sidebar/nav, or the not-yet-executed nav-and-perf-redesign spec.
- `docs/superpowers/ui/order-list.md` allows the order card to open either a full detail page or an equivalent slide-over panel ("`/order_list/[orderId]` หรือ detail panel ที่มีข้อมูลเทียบเท่ากัน"). This plan uses the existing full-page `OrderDetailWorkspace` (already built) rather than building a new slide-over — a valid choice under the spec's own wording, and it avoids duplicating the already-working detail/edit UI. This also satisfies the doc's "progress panel" requirement (all steps, current step, status transition) — `OrderDetailWorkspace` already renders a full `StepProgress` and status-change form; the order card itself only needs a compact status badge (`ORDER_STATUS_STEPS` label), not a second per-card step-dots widget.

---

## Phase A — Dashboard (`/dashboard`, แบบ D)

### Task 1: Add the dashboard status-bucket helper

`dashboard.md` collapses the real 6-step lifecycle into 4 display buckets ("รับแล้ว, กำลังจัดช่อ, พร้อมรับ, สำเร็จ"). This mapping needs to live in one place so it can't drift from `ORDER_STATUS_STEPS`.

**Files:**
- Create: `src/lib/dashboardStatus.ts`

**Interfaces:**
- Consumes: `OrderStatus` from `@/lib/orderStatus`.
- Produces: `DashboardStatusBucket` type, `DASHBOARD_STATUS_BUCKETS` array, `getDashboardStatusBucket(status)` — consumed by Task 5 (`StatusOverview`).

- [ ] **Step 1: Write the helper**

```ts
// src/lib/dashboardStatus.ts
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
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dashboardStatus.ts
git commit -m "feat: add dashboard 4-bucket status mapping"
```

---

### Task 2: Expand `DashboardPage.tsx`'s data layer

Replaces the current aggregate-only query (`status, bouquet_price, delivery_info(delivery_price)`) with a per-order row set that also carries what the timeline and delivery-rounds cards need, and adds error/retry handling plus the theme toggle and header.

**Files:**
- Modify: `src/components/dashboard/DashboardPage.tsx`

**Interfaces:**
- Produces: exported `DashboardOrderRow` type — consumed by Tasks 4 (`TodayTimeline`) and 6 (`DeliveryRounds`).
- Consumes: `FinancialSummary` (Task 3), `StatusOverview` (Task 5), `TodayTimeline` (Task 4), `DeliveryRounds` (Task 6) — all wired in Task 7. Write this task's file now with those imports; the imported files don't exist yet, so `tsc` will show missing-module errors until Task 7 completes the phase — that's expected mid-phase and is resolved by the end of Task 7's verify step.

- [ ] **Step 1: Replace the file**

```tsx
// src/components/dashboard/DashboardPage.tsx
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

const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DashboardPage.tsx
git commit -m "feat: expand dashboard data layer with split totals, error/retry, theme toggle"
```

(Type-checking is deferred to Task 7, once the imported components below exist.)

---

### Task 3: Build `FinancialSummary` (replaces `MetricCards`)

**Files:**
- Create: `src/components/dashboard/FinancialSummary.tsx`
- Delete: `src/components/dashboard/MetricCards.tsx`

**Interfaces:**
- Produces: `FinancialSummary` with props `{ orderCount: number; bouquetTotal: number; deliveryTotal: number; grandTotal: number; dateHref: string }` — consumed by `DashboardPage.tsx` (Task 2, already written).

- [ ] **Step 1: Write the component**

```tsx
// src/components/dashboard/FinancialSummary.tsx
import Link from "next/link";

type FinancialSummaryProps = {
  orderCount: number;
  bouquetTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  dateHref: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export const FinancialSummary = ({
  orderCount,
  bouquetTotal,
  deliveryTotal,
  grandTotal,
  dateHref,
}: FinancialSummaryProps) => {
  const cards = [
    { label: "ออเดอร์ทั้งหมด", value: String(orderCount) },
    { label: "ยอดค่าช่อ", value: `${formatMoney(bouquetTotal)} บาท` },
    { label: "ค่าจัดส่ง", value: `${formatMoney(deliveryTotal)} บาท` },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={dateHref}
          className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-rose-200 dark:border-white/10 dark:bg-[#1a211c]"
        >
          <div className="text-xs text-stone-500 dark:text-stone-400">{card.label}</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
            {card.value}
          </div>
        </Link>
      ))}
      <Link
        href={dateHref}
        className="rounded-2xl border-2 border-[#dd5f83] bg-[#fff1f4] p-4 transition hover:bg-[#ffe5ec] dark:border-[#e96a8d] dark:bg-[#2a1c22]"
      >
        <div className="text-xs font-medium text-[#9f3e5d] dark:text-rose-200">ยอดทั้งหมด</div>
        <div className="mt-1 text-xl font-bold tabular-nums text-[#9f3e5d] dark:text-rose-100">
          {formatMoney(grandTotal)} บาท
        </div>
        <div className="mt-0.5 text-[10px] text-[#b44767] dark:text-rose-300">ค่าช่อ + ค่าจัดส่ง</div>
      </Link>
    </div>
  );
};
```

- [ ] **Step 2: Delete the old component**

```bash
git rm src/components/dashboard/MetricCards.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/FinancialSummary.tsx
git commit -m "feat: add FinancialSummary 4-card component, retire MetricCards"
```

---

### Task 4: Build `TodayTimeline`

**Files:**
- Create: `src/components/dashboard/TodayTimeline.tsx`

**Interfaces:**
- Consumes: `DashboardOrderRow` from `./DashboardPage`; `getStatusStep` from `@/lib/orderStatus`.
- Produces: `TodayTimeline` with props `{ orders: DashboardOrderRow[]; viewAllHref: string }` — consumed by `DashboardPage.tsx`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/dashboard/TodayTimeline.tsx
import Link from "next/link";
import { Store, Truck } from "lucide-react";
import { getStatusStep } from "@/lib/orderStatus";
import type { DashboardOrderRow } from "./DashboardPage";

type TodayTimelineProps = {
  orders: DashboardOrderRow[];
  viewAllHref: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getDeliveryPrice = (value: DashboardOrderRow["delivery_info"]) => {
  const record = Array.isArray(value) ? value[0] : value;
  return toNumber(record?.delivery_price);
};

export const TodayTimeline = ({ orders, viewAllHref }: TodayTimelineProps) => {
  const sorted = [...orders].sort((a, b) => {
    if (!a.delivery_time) return 1;
    if (!b.delivery_time) return -1;
    return a.delivery_time.localeCompare(b.delivery_time);
  });

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">คิววันนี้</h3>
        <Link href={viewAllHref} className="text-xs font-medium text-[#d34f77] hover:underline dark:text-rose-300">
          ดูทั้งหมด
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((order) => {
            const isDelivery = order.pickup_mode === "delivery";
            const step = getStatusStep(order.status);
            const total = toNumber(order.bouquet_price) + (isDelivery ? getDeliveryPrice(order.delivery_info) : 0);

            return (
              <li key={order.id}>
                <Link
                  href={`/order_list/${order.id}`}
                  className="grid grid-cols-[52px_28px_1fr_auto] items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-rose-100 hover:bg-rose-50/60 dark:hover:border-white/10 dark:hover:bg-white/5"
                >
                  <span className="text-xs font-medium tabular-nums text-stone-500 dark:text-stone-400">
                    {order.delivery_time ? `${order.delivery_time} น.` : "-"}
                  </span>
                  <span
                    className={`grid size-7 place-items-center rounded-full ${
                      isDelivery ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-[#d34f77]"
                    }`}
                  >
                    {isDelivery ? <Truck size={14} /> : <Store size={14} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                      #{order.order_no ?? order.id} · {order.customer?.line_name || "-"}
                    </span>
                    <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                      {isDelivery ? "จัดส่ง" : "หน้าร้าน SweetPea"} · ฿{formatMoney(total)}
                    </span>
                  </span>
                  {step && <span className={`badge ${step.badgeClass} shrink-0 text-white`}>{step.label}</span>}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/TodayTimeline.tsx
git commit -m "feat: add dashboard TodayTimeline"
```

---

### Task 5: Build `StatusOverview` (replaces `StatusBreakdown`)

**Files:**
- Create: `src/components/dashboard/StatusOverview.tsx`
- Delete: `src/components/dashboard/StatusBreakdown.tsx`

**Interfaces:**
- Consumes: `DASHBOARD_STATUS_BUCKETS`, `getDashboardStatusBucket` from `@/lib/dashboardStatus` (Task 1); `ORDER_STATUS_STEPS` from `@/lib/orderStatus`.
- Produces: `StatusOverview` with props `{ counts: Record<OrderStatus, number> }` — consumed by `DashboardPage.tsx`.

- [ ] **Step 1: Write the component**

```tsx
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
```

- [ ] **Step 2: Delete the old component**

```bash
git rm src/components/dashboard/StatusBreakdown.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatusOverview.tsx
git commit -m "feat: add dashboard StatusOverview 4-bucket card, retire StatusBreakdown"
```

---

### Task 6: Build `DeliveryRounds`

**Files:**
- Create: `src/components/dashboard/DeliveryRounds.tsx`

**Interfaces:**
- Consumes: `DashboardOrderRow` from `./DashboardPage`.
- Produces: `DeliveryRounds` with props `{ orders: DashboardOrderRow[] }` — consumed by `DashboardPage.tsx`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/dashboard/DeliveryRounds.tsx
import { Truck } from "lucide-react";
import type { DashboardOrderRow } from "./DashboardPage";

type DeliveryRoundsProps = {
  orders: DashboardOrderRow[];
};

export const DeliveryRounds = ({ orders }: DeliveryRoundsProps) => {
  const deliveryOrders = orders.filter((order) => order.pickup_mode === "delivery" && order.delivery_time);
  const rounds = new Map<string, number>();

  for (const order of deliveryOrders) {
    const time = order.delivery_time as string;
    rounds.set(time, (rounds.get(time) ?? 0) + 1);
  }

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <h3 className="mb-4 text-sm font-semibold text-stone-800 dark:text-stone-100">รอบจัดส่ง</h3>
      {sortedRounds.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ไม่มีรอบจัดส่งในช่วงเวลานี้</p>
      ) : (
        <ul className="space-y-2">
          {sortedRounds.map(([time, count]) => (
            <li
              key={time}
              className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
                <Truck size={14} className="text-amber-700 dark:text-amber-300" /> {time} น.
              </span>
              <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                {count} ออเดอร์
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DeliveryRounds.tsx
git commit -m "feat: add dashboard DeliveryRounds"
```

---

### Task 7: Verify and QA the dashboard phase

**Files:** none (verification only).

- [ ] **Step 1: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors (all of `FinancialSummary`, `TodayTimeline`, `StatusOverview`, `DeliveryRounds` now exist, resolving the imports written in Task 2).

- [ ] **Step 2: Manual QA**

Run: `npm run dev`, open `http://localhost:3000/dashboard`.

Check against `dashboard.md` acceptance criteria:
- Switch date-range preset (วันนี้ / 7 วัน / 30 วัน); confirm the 4 summary cards, timeline, status overview, and delivery rounds all update together from the same fetch.
- Confirm `ยอดค่าช่อ + ค่าจัดส่ง = ยอดทั้งหมด` displayed.
- Confirm a pickup-only order in range does not add to `ค่าจัดส่ง`.
- Click any summary card or "ดูทั้งหมด"; confirm it opens `/order_list` with a `deliveryDate` matching the dashboard's selected start date.
- Resize to 768px width; confirm no horizontal scroll and the timeline/queue remain usable.
- Toggle the theme button; confirm dashboard cards, timeline, and the date-range popover all switch light/dark without a stray white/black surface.
- Pick an empty date range (e.g. a future date); confirm the "ยังไม่มีออเดอร์ในช่วงเวลานี้" empty state with its "เพิ่มรายการใหม่" button appears.

- [ ] **Step 3: Commit (if QA turns up fixes)**

```bash
git add -A
git commit -m "fix: address dashboard QA findings"
```

---

## Phase B — Order List (`/order_list`, แบบ D)

### Task 8: Add `getOrderTotal` helper and make the customer join inner

**Files:**
- Modify: `src/components/orderlist/types.ts`

**Interfaces:**
- Produces: `getOrderTotal(order: OrderRecord) => { bouquet: number; deliveryFee: number; total: number }` — consumed by Tasks 11 (`OrderListSummaryCards`) and 12 (`OrderTimelineCard`).
- Every `order` in `OrderRecord` has a non-null `customer_id` (enforced by the create flow — `Formorder`/`useOrderFormState` always inserts the customer row before the order row), so switching the join to `!inner` is safe and is what makes server-side search-by-customer-name/phone possible in Task 16.

- [ ] **Step 1: Add the helper**

Add after the existing `getDeliveryInfo` export in `src/components/orderlist/types.ts`:

```ts
export const getOrderTotal = (order: OrderRecord) => {
  const delivery = getDeliveryInfo(order.delivery_info);
  const bouquet = Number(order.bouquet_price ?? 0);
  const deliveryFee = order.pickup_mode === "delivery" ? Number(delivery?.delivery_price ?? 0) : 0;
  return { bouquet, deliveryFee, total: bouquet + deliveryFee };
};
```

- [ ] **Step 2: Switch the customer join to `!inner`**

In `ORDER_SELECT`, change:

```ts
  customer:customer_id (
    id,
    line_name,
    phone,
    note
  ),
```

to:

```ts
  customer:customer_id!inner (
    id,
    line_name,
    phone,
    note
  ),
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors. This confirms `OrderDetailWorkspace` and the print route (unchanged so far) still work against the `!inner` select.

- [ ] **Step 4: Commit**

```bash
git add src/components/orderlist/types.ts
git commit -m "feat: add getOrderTotal helper, make order->customer join inner for search"
```

---

### Task 9: Add shared search-params type, remove the old filter form

**Files:**
- Create: `src/components/orderlist/searchParams.ts`
- Delete: `src/components/orderlist/OrderFilterForm.tsx`

**Interfaces:**
- Produces: `OrderListSearchParams` type (`{ q?, deliveryDate?, pickupMode?, status?, page? }`), `ORDER_LIST_PAGE_SIZE` constant (`25`) — consumed by Tasks 10, 11, 13, 14, 16.

- [ ] **Step 1: Write the file**

```ts
// src/components/orderlist/searchParams.ts
export type OrderListSearchParams = {
  q?: string;
  deliveryDate?: string;
  pickupMode?: string;
  status?: string;
  page?: string;
};

export const ORDER_LIST_PAGE_SIZE = 25;
```

- [ ] **Step 2: Delete the old filter form**

```bash
git rm src/components/orderlist/OrderFilterForm.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/orderlist/searchParams.ts
git commit -m "feat: add shared order-list search params type, retire OrderFilterForm"
```

(`tsc` will show errors in `order_list/page.tsx` and `OrderListTable.tsx` — both still reference the deleted file. This is resolved by Tasks 13 and 16.)

---

### Task 10: Build `OrderListFilterBar`

Client component: debounced search box, date/pickup/status filters, active-filter chips — all URL-driven per `order-list.md`'s "Search ใช้ debounce; filter/sort/page เก็บใน URL" and "เปลี่ยน filter ใหม่ต้องกลับไปหน้า 1".

**Files:**
- Create: `src/components/orderlist/OrderListFilterBar.tsx`

**Interfaces:**
- Consumes: `OrderListSearchParams` from `./searchParams` (Task 9); `ORDER_STATUS_STEPS` from `@/lib/orderStatus`.
- Produces: `OrderListFilterBar` with props `{ searchParams: OrderListSearchParams }` — consumed by `order_list/page.tsx` (Task 16).

- [ ] **Step 1: Write the component**

```tsx
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
          defaultValue={searchParams.deliveryDate ?? ""}
          onChange={(e) => pushParams({ deliveryDate: e.target.value })}
          className="input input-bordered input-sm dark:border-white/10 dark:bg-white/5"
        />

        <select
          defaultValue={searchParams.pickupMode ?? "all"}
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
          defaultValue={searchParams.status ?? "all"}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/orderlist/OrderListFilterBar.tsx
git commit -m "feat: add OrderListFilterBar with debounced search and URL-driven filters"
```

---

### Task 11: Build `OrderListSummaryCards`

**Files:**
- Create: `src/components/orderlist/OrderListSummaryCards.tsx`

**Interfaces:**
- Consumes: `OrderRecord`, `getOrderTotal` from `./types` (Task 8).
- Produces: `OrderListSummaryCards` with props `{ orders: OrderRecord[] }` — consumed by `order_list/page.tsx` (Task 16).

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderListSummaryCards.tsx
import type { OrderRecord } from "./types";
import { getOrderTotal } from "./types";

type OrderListSummaryCardsProps = {
  orders: OrderRecord[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export const OrderListSummaryCards = ({ orders }: OrderListSummaryCardsProps) => {
  const deliveryCount = orders.filter((order) => order.pickup_mode === "delivery").length;
  const total = orders.reduce((sum, order) => sum + getOrderTotal(order).total, 0);

  const cards = [
    { label: "คิวที่แสดง", value: String(orders.length) },
    { label: "จัดส่ง", value: String(deliveryCount) },
    { label: "ยอดรวม", value: `${formatMoney(total)} บาท` },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]"
        >
          <div className="text-xs text-stone-500 dark:text-stone-400">{card.label}</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-stone-800 dark:text-stone-100">{card.value}</div>
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/orderlist/OrderListSummaryCards.tsx
git commit -m "feat: add OrderListSummaryCards"
```

---

### Task 12: Build `OrderTimelineCard`

The clickable card is its own client component (not an `<a>`/`Link`) so the phone number can be a real, separately-focusable `tel:` link without the invalid nested-`<a>`-in-`<a>` markup the doc explicitly warns against ("ไม่เกิด nested interactive element").

**Files:**
- Create: `src/components/orderlist/OrderTimelineCard.tsx`

**Interfaces:**
- Consumes: `OrderRecord`, `getOrderTotal` from `./types` (Task 8); `getStatusStep` from `@/lib/orderStatus`.
- Produces: `OrderTimelineCard` with props `{ order: OrderRecord; isOverdue: boolean }` — consumed by `OrderListTimeline` (Task 13).

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderTimelineCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Store, Truck } from "lucide-react";
import { getStatusStep } from "@/lib/orderStatus";
import type { OrderRecord } from "./types";
import { getOrderTotal } from "./types";

type OrderTimelineCardProps = {
  order: OrderRecord;
  isOverdue: boolean;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export const OrderTimelineCard = ({ order, isOverdue }: OrderTimelineCardProps) => {
  const router = useRouter();
  const isDelivery = order.pickup_mode === "delivery";
  const step = getStatusStep(order.status);
  const { total } = getOrderTotal(order);
  const href = `/order_list/${order.id}`;

  const openDetail = () => router.push(href);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="grid cursor-pointer grid-cols-1 gap-2 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-white/10 dark:bg-[#1a211c] sm:grid-cols-[64px_1fr_auto_auto_auto_20px] sm:items-center"
    >
      <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
        {order.delivery_time ? `${order.delivery_time} น.` : "-"}
        {isOverdue && (
          <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            เลยเวลา
          </span>
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
          #{order.order_no ?? order.id} · {order.customer?.line_name || "-"}
        </span>
        {order.customer?.phone ? (
          <a
            href={`tel:${order.customer.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-xs text-stone-500 hover:underline dark:text-stone-400"
          >
            {order.customer.phone}
          </a>
        ) : (
          <span className="block truncate text-xs text-stone-500 dark:text-stone-400">-</span>
        )}
      </span>

      <span className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
        {isDelivery ? <Truck size={13} /> : <Store size={13} />}
        {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
      </span>

      <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
        ฿{formatMoney(total)}
      </span>

      {step && <span className={`badge ${step.badgeClass} w-24 justify-center text-white`}>{step.label}</span>}

      <ChevronRight size={16} className="hidden text-stone-300 sm:block dark:text-white/20" />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/orderlist/OrderTimelineCard.tsx
git commit -m "feat: add OrderTimelineCard (keyboard-accessible, real tel: link)"
```

---

### Task 13: Build `OrderListTimeline`, delete the old table

Groups the current page's orders by `delivery_date`, sorts each group by `delivery_time`, and renders one `OrderTimelineCard` per order behind a vertical timeline rail. Per `order-list.md`: "Group เฉพาะผลลัพธ์ของ page ปัจจุบัน; ห้ามดึงทั้งตารางเพื่อ group ฝั่ง client" — this only ever receives the already-paginated `orders` array from the server component.

**Files:**
- Create: `src/components/orderlist/OrderListTimeline.tsx`
- Delete: `src/components/orderlist/OrderListTable.tsx`

**Interfaces:**
- Consumes: `OrderRecord` from `./types`; `OrderTimelineCard` (Task 12).
- Produces: `OrderListTimeline` with props `{ orders: OrderRecord[] }` — consumed by `order_list/page.tsx` (Task 16).

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderListTimeline.tsx
import { Store, Truck } from "lucide-react";
import type { OrderRecord } from "./types";
import { OrderTimelineCard } from "./OrderTimelineCard";

type OrderListTimelineProps = {
  orders: OrderRecord[];
};

const UNSCHEDULED_KEY = "__unscheduled__";

const formatDateHeading = (value: string) =>
  new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long" }).format(new Date(value));

export const OrderListTimeline = ({ orders }: OrderListTimelineProps) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-sm text-stone-500 dark:text-stone-400">ไม่พบออเดอร์ที่ตรงกับตัวกรอง</p>
      </div>
    );
  }

  const groups = new Map<string, OrderRecord[]>();
  for (const order of orders) {
    const key = order.delivery_date ?? UNSCHEDULED_KEY;
    const list = groups.get(key) ?? [];
    list.push(order);
    groups.set(key, list);
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === UNSCHEDULED_KEY) return 1;
    if (b === UNSCHEDULED_KEY) return -1;
    return a.localeCompare(b);
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      {sortedKeys.map((key) => {
        const groupOrders = [...(groups.get(key) ?? [])].sort((a, b) => {
          if (!a.delivery_time) return 1;
          if (!b.delivery_time) return -1;
          return a.delivery_time.localeCompare(b.delivery_time);
        });

        return (
          <section key={key}>
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {key === UNSCHEDULED_KEY ? "ยังไม่ระบุวันนัด" : formatDateHeading(key)}
              </h3>
              <span className="text-xs text-stone-400">
                {groupOrders.length} รายการ
                {key !== UNSCHEDULED_KEY && " · เรียงตามเวลานัดรับ"}
              </span>
            </div>

            <ol className="relative space-y-3 border-l-2 border-stone-200 pl-5 dark:border-white/10">
              {groupOrders.map((order) => {
                const isOverdue = Boolean(
                  key !== UNSCHEDULED_KEY &&
                    order.delivery_time &&
                    order.status !== "delivered" &&
                    new Date(`${key}T${order.delivery_time}`) < now,
                );

                return (
                  <li key={order.id} className="relative">
                    <span
                      className={`absolute -left-[27px] top-3 grid size-5 place-items-center rounded-full ring-4 ring-[#faf9f7] dark:ring-[#121713] ${
                        order.pickup_mode === "delivery" ? "bg-amber-500" : "bg-[#dd5f83]"
                      }`}
                    >
                      {order.pickup_mode === "delivery" ? (
                        <Truck size={11} className="text-white" />
                      ) : (
                        <Store size={11} className="text-white" />
                      )}
                    </span>
                    <OrderTimelineCard order={order} isOverdue={isOverdue} />
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Delete the old table**

```bash
git rm src/components/orderlist/OrderListTable.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/components/orderlist/OrderListTimeline.tsx
git commit -m "feat: add date-grouped OrderListTimeline, retire OrderListTable"
```

---

### Task 14: Build `OrderListPagination`

**Files:**
- Create: `src/components/orderlist/OrderListPagination.tsx`

**Interfaces:**
- Consumes: `OrderListSearchParams` from `./searchParams` (Task 9).
- Produces: `OrderListPagination` with props `{ page: number; pageSize: number; totalCount: number; searchParams: OrderListSearchParams }` — consumed by `order_list/page.tsx` (Task 16).

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderListPagination.tsx
import Link from "next/link";
import type { OrderListSearchParams } from "./searchParams";

type OrderListPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: OrderListSearchParams;
};

const buildHref = (page: number, searchParams: OrderListSearchParams) => {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.deliveryDate) params.set("deliveryDate", searchParams.deliveryDate);
  if (searchParams.pickupMode) params.set("pickupMode", searchParams.pickupMode);
  if (searchParams.status) params.set("status", searchParams.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/order_list?${query}` : "/order_list";
};

export const OrderListPagination = ({ page, pageSize, totalCount, searchParams }: OrderListPaginationProps) => {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);

  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="text-xs text-stone-500 dark:text-stone-400">
        {from}–{to} จาก {totalCount}
      </span>
      <div className="flex gap-2">
        <Link
          href={buildHref(Math.max(1, page - 1), searchParams)}
          aria-disabled={page <= 1}
          className={`btn btn-sm btn-outline ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          ก่อนหน้า
        </Link>
        <Link
          href={buildHref(Math.min(totalPages, page + 1), searchParams)}
          aria-disabled={page >= totalPages}
          className={`btn btn-sm btn-outline ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          ถัดไป
        </Link>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/orderlist/OrderListPagination.tsx
git commit -m "feat: add OrderListPagination"
```

---

### Task 15: Build `OrderListThemeToggle`

Small, self-contained client component so the server-rendered `order_list/page.tsx` can still offer the header theme switcher the doc requires ("ขวา: theme switcher และปุ่ม primary เพิ่มออเดอร์").

**Files:**
- Create: `src/components/orderlist/OrderListThemeToggle.tsx`

**Interfaces:**
- Produces: `OrderListThemeToggle` (no props) — consumed by `order_list/page.tsx` (Task 16).

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderListThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const OrderListThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((current) => !current)}
      className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/8 dark:text-amber-300"
      aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/orderlist/OrderListThemeToggle.tsx
git commit -m "feat: add OrderListThemeToggle"
```

---

### Task 16: Rewrite `order_list/page.tsx` with server-side search, filter, and pagination

**Files:**
- Modify: `src/app/order_list/page.tsx`

**Interfaces:**
- Consumes: everything built in Tasks 8–15.

- [ ] **Step 1: Replace the file**

```tsx
// src/app/order_list/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { ORDER_SELECT } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import type { OrderListSearchParams } from "@/components/orderlist/searchParams";
import { ORDER_LIST_PAGE_SIZE } from "@/components/orderlist/searchParams";
import { OrderListFilterBar } from "@/components/orderlist/OrderListFilterBar";
import { OrderListSummaryCards } from "@/components/orderlist/OrderListSummaryCards";
import { OrderListTimeline } from "@/components/orderlist/OrderListTimeline";
import { OrderListPagination } from "@/components/orderlist/OrderListPagination";
import { OrderListThemeToggle } from "@/components/orderlist/OrderListThemeToggle";

type OrderListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const asString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function OrderListPage({ searchParams }: OrderListPageProps) {
  const rawParams = await searchParams;
  const params: OrderListSearchParams = {
    q: asString(rawParams.q),
    deliveryDate: asString(rawParams.deliveryDate),
    pickupMode: asString(rawParams.pickupMode),
    status: asString(rawParams.status),
    page: asString(rawParams.page),
  };

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * ORDER_LIST_PAGE_SIZE;
  const to = from + ORDER_LIST_PAGE_SIZE - 1;

  const supabase = await supabaseServer();
  let query = supabase
    .from("order")
    .select(ORDER_SELECT, { count: "exact" })
    .order("order_no", { ascending: false });

  const trimmedQuery = params.q?.trim();
  if (trimmedQuery) {
    if (/^\d+$/.test(trimmedQuery)) {
      query = query.eq("order_no", Number(trimmedQuery));
    } else {
      query = query.or(`line_name.ilike.%${trimmedQuery}%,phone.ilike.%${trimmedQuery}%`, {
        foreignTable: "customer",
      });
    }
  }

  if (params.deliveryDate) {
    query = query.eq("delivery_date", params.deliveryDate);
  }

  if (params.pickupMode && params.pickupMode !== "all") {
    query = query.eq("pickup_mode", params.pickupMode);
  }

  if (params.status === "not_delivered") {
    query = query.neq("status", "delivered");
  } else if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query.range(from, to).returns<OrderRecord[]>();

  const orders = data ?? [];
  const totalCount = count ?? 0;

  if (orders.length === 0 && page > 1 && totalCount > 0) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.deliveryDate) next.set("deliveryDate", params.deliveryDate);
    if (params.pickupMode) next.set("pickupMode", params.pickupMode);
    if (params.status) next.set("status", params.status);
    redirect(`/order_list?${next.toString()}`);
  }

  return (
    <div className="min-h-screen p-4 dark:bg-[#121713]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-stone-400">คำสั่งซื้อ / ทั้งหมด</p>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            รายการคำสั่งซื้อ <span className="text-base font-normal text-stone-400">({totalCount})</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
          <OrderListThemeToggle />
        </div>
      </div>

      <OrderListFilterBar searchParams={params} />

      {error && <p className="mb-4 text-sm font-medium text-red-600">{error.message}</p>}

      <OrderListSummaryCards orders={orders} />

      <OrderListTimeline orders={orders} />

      <OrderListPagination page={page} pageSize={ORDER_LIST_PAGE_SIZE} totalCount={totalCount} searchParams={params} />
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/order_list/page.tsx
git commit -m "feat: rewrite order_list/page.tsx with server-side search, filter, pagination"
```

---

### Task 17: Add loading and error states

**Files:**
- Create: `src/app/order_list/loading.tsx`
- Create: `src/app/order_list/error.tsx`

**Interfaces:** none beyond Next.js's file-convention `loading`/`error` boundaries for the `order_list` route segment.

- [ ] **Step 1: Write the loading skeleton**

```tsx
// src/app/order_list/loading.tsx
export default function OrderListLoading() {
  return (
    <div className="p-4">
      <div className="mb-4 h-8 w-48 animate-pulse rounded bg-stone-200 dark:bg-white/10" />
      <div className="mb-4 h-16 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the error boundary**

```tsx
// src/app/order_list/error.tsx
"use client";

export default function OrderListError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="mb-3">โหลดรายการคำสั่งซื้อไม่สำเร็จ</p>
        <button type="button" onClick={reset} className="btn btn-sm btn-outline">
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/order_list/loading.tsx src/app/order_list/error.tsx
git commit -m "feat: add order_list loading skeleton and error boundary"
```

---

### Task 18: Verify and QA the order-list phase

**Files:** none (verification only).

- [ ] **Step 1: Full checks**

Run: `npx tsc --noEmit --pretty false`, `git diff --check`, `npm run lint`
Expected: no errors; no new lint errors beyond the three pre-existing ones already documented in the prior session's plan (`FileuploaderActual.tsx`, `useOrderFormState.ts`, `Navbar2.tsx` warnings).

- [ ] **Step 2: Manual QA**

Run: `npm run dev`, open `http://localhost:3000/order_list`.

Check against `order-list.md` acceptance criteria:
- Default view: all orders, paginated 25/page, newest `order_no` first, grouped by delivery date with "ยังไม่ระบุวันนัด" last.
- Type a customer name into search; confirm results filter after the debounce and the URL updates with `?q=...`.
- Type an order number into search; confirm it matches by `order_no` exactly.
- Set date/pickup/status filters; confirm chips appear, each removable individually, "ล้างตัวกรอง" clears everything, and changing any filter resets to page 1.
- Click "ถัดไป"/"ก่อนหน้า"; confirm the range label ("26–50 จาก ...") and URL `page` param update correctly.
- Click an order card (pointer) and, separately, `Tab` to a card and press `Enter`; confirm both open `/order_list/[orderId]`.
- Click the phone number on a card; confirm it does not also navigate to the detail page (event does not bubble to the card).
- From a filtered/paginated list, open an order, then use the browser back button; confirm the same filters/page are still applied.
- Resize to 768–1024px; confirm no `overflow-x-auto` table remains and no horizontal scroll occurs.
- Toggle the theme button; confirm cards, filter bar, and chips all switch light/dark cleanly.
- With zero matching results, confirm "ไม่พบออเดอร์ที่ตรงกับตัวกรอง" appears.

- [ ] **Step 3: Commit (if QA turns up fixes)**

```bash
git add -A
git commit -m "fix: address order-list QA findings"
```

---

## Phase C — Order Print (`/order_print/[orderId]`, แบบ A)

Research confirms the current print route already implements nearly all of `order-print.md`: A4 layout, rose header, `break-inside: avoid` sections, hidden nav, `print-color-adjust: exact`, full data sections, 6-item checklist, images, and signatures. The only gap is that it duplicates `OrderRecord`/`ORDER_SELECT` instead of using the shared ones from `orderlist/types.ts` — a DRY risk (schema changes could silently drift between the two), not a missing feature.

### Task 19: Dedupe types in the print route

**Files:**
- Modify: `src/app/order_print/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `ORDER_SELECT`, `OrderRecord`, `getDeliveryInfo` from `@/components/orderlist/types` (the `!inner` customer join from Task 8 applies here too — safe, every order has a customer).

- [ ] **Step 1: Replace the local type definitions with shared imports**

Change the top of the file from:

```tsx
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { AutoPrint } from "./AutoPrint";
import { getStatusStep, type OrderStatus } from "@/lib/orderStatus";

type PrintOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type OrderItem = {
  lineNo?: number;
  flowerType?: string;
  flowerColor?: string;
  quantity?: number;
};

type Customer = {
  line_name?: string | null;
  phone?: string | null;
};

type DeliveryInfo = {
  recipient_name?: string | null;
  recipient_phone?: string | null;
  address?: string | null;
  map_link?: string | null;
  delivery_price?: number | string | null;
};

type Attachment = {
  label?: string | null;
  file_name?: string | null;
  src?: string | null;
};

type PrintableOrder = {
  id: number | string;
  order_no: number | string | null;
  status: OrderStatus;
  items: OrderItem[] | null;
  pickup_mode: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  paper_color: string | null;
  bow_color: string | null;
  bouquet_price: number | string | null;
  has_card: boolean | null;
  card_message: string | null;
  created_at: string | null;
  customer: Customer | null;
  delivery_info: DeliveryInfo[] | DeliveryInfo | null;
  attachments: Attachment[] | null;
};
```

to:

```tsx
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { AutoPrint } from "./AutoPrint";
import { getStatusStep } from "@/lib/orderStatus";
import { ORDER_SELECT, getDeliveryInfo } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";

type PrintOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};
```

- [ ] **Step 2: Remove the local `getDeliveryInfo` and switch the query**

Delete:

```ts
const getDeliveryInfo = (value: PrintableOrder["delivery_info"]) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
};
```

Change the query from:

```ts
  const { data, error } = await supabase
    .from("order")
    .select(
      `
        id,
        order_no,
        status,
        items,
        pickup_mode,
        delivery_date,
        delivery_time,
        paper_color,
        bow_color,
        bouquet_price,
        has_card,
        card_message,
        created_at,
        customer:customer_id (
          line_name,
          phone
        ),
        delivery_info (
          recipient_name,
          recipient_phone,
          address,
          map_link,
          delivery_price
        ),
        attachments (
          label,
          file_name,
          src
        )
      `,
    )
    .eq("id", orderId)
    .single<PrintableOrder>();
```

to:

```ts
  const { data, error } = await supabase
    .from("order")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single<OrderRecord>();
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors. `data.items`, `data.delivery_info`, `data.attachments`, `data.customer` all keep working unchanged — `OrderRecord`'s shapes are supersets of what this page already reads (it just gains a few extra fields on `data` it doesn't render, which is harmless).

- [ ] **Step 4: Commit**

```bash
git add "src/app/order_print/[orderId]/page.tsx"
git commit -m "refactor: dedupe order_print types onto shared OrderRecord/ORDER_SELECT"
```

---

### Task 20: QA the print phase

**Files:** none (verification only).

- [ ] **Step 1: Manual QA**

Run: `npm run dev`. Open `/order_print/[orderId]` for one pickup order and one delivery order (use IDs already in the database, e.g. the order saved earlier while testing the wizard).

Check against `order-print.md` acceptance criteria:
- Print preview shows the same data as the saved order (customer, items, wrap, card, fulfilment, totals).
- Pickup order: no delivery fee shown, total = bouquet price only.
- Delivery order: delivery section renders with recipient/address/fee, total = bouquet + delivery.
- No horizontal overflow; main content fits one A4 page for a normal-length order.
- Open the browser print dialog (`Cmd/Ctrl+P`) and confirm no sidebar, nav, or button controls appear in the preview.

- [ ] **Step 2: Commit (if QA turns up fixes)**

```bash
git add -A
git commit -m "fix: address order-print QA findings"
```

---

## Task 21: Final validation pass across all three phases

**Files:** none (verification only).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit --pretty false`
Expected: zero errors.

- [ ] **Step 2: Whitespace/diff check**

Run: `git diff --check`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors beyond the three pre-existing ones from the prior session's plan.

- [ ] **Step 4: Confirm no dangling references**

Run: `grep -rn "MetricCards\|StatusBreakdown\|OrderFilterForm\|OrderListTable" src`
Expected: no matches (all four retired components fully replaced across Tasks 3, 5, 9, 13).

- [ ] **Step 5: Cross-phase regression check**

Manually open `/dashboard`, click through to `/order_list` with a date filter, open an order's detail page from there, and confirm the previously-built `OrderDetailWorkspace` still renders correctly (its data now flows through the `!inner` customer join from Task 8) and that `/order_form` still saves and opens `/order_print/[orderId]` correctly end-to-end.

- [ ] **Step 6: Commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address cross-phase issues found in final validation pass"
```
