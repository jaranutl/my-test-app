# Prototype Visual Parity (Dashboard D, Order List D, Order Form B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the three already-functional real pages — `/dashboard`, `/order_list`, `/order_form` — so their visual layout closely matches the specific prototype mockup variants the user picked from `http://localhost:3000/prototype`: Dashboard → **variant D**, Order List → **variant D**, Order Form → **variant B**.

**Architecture:** This is a **visual/layout port, not a functional rebuild**. All three real pages already have correct data-fetching, Supabase queries, filtering, pagination, and wizard-step logic from prior plans this session. Every task in this plan touches only JSX structure, Tailwind classes, and copy — never the underlying data/state logic — unless a task explicitly says otherwise (a few tasks add small, clearly-scoped functional pieces, like a "วันนี้" quick-filter button, because the prototype shows one).

**Tech Stack:** Next.js App Router, React, Tailwind, lucide-react icons — same stack already in use, no new dependencies.

## Global Constraints

- **No sidebar.** The prototypes render inside a `DesktopRail`/`MobileNav` shell (`src/app/prototype/nav-redesign/page.tsx` lines 86-223, `src/app/prototype/order-list/page.tsx` lines ~140-198). The user explicitly confirmed earlier in this session that the real app keeps its existing top `Navbar2` — do not port the sidebar. Only the **content area** below/inside the existing page layout is restyled.
- **No slide-over detail panel.** Order List variant D's prototype includes a right-side slide-over "รายละเอียดและความคืบหน้า" panel with photo upload and progress-step buttons (`order-list/page.tsx` lines 673+). The real app already has a full-page equivalent (`OrderDetailWorkspace`, from an earlier plan) — order cards keep navigating to `/order_list/[orderId]` on click. Do not build a slide-over panel.
- **Real status data only.** The prototypes use their own mock status enums (dashboard: a static `orders` array with `status`/`tone` strings; order-list: `"รอชำระ" | "รับออเดอร์แล้ว" | "กำลังจัดช่อ" | "พร้อมรับ" | "สำเร็จ"` — 5 values). The real app's source of truth is `ORDER_STATUS_STEPS` (`src/lib/orderStatus.ts`, 6 values: `new/arranging/wrapping/ready_for_delivery/out_for_delivery/delivered`) and each step's `badgeClass`. Never hardcode the prototype's mock status strings or tone colors — always derive badge color/label from the real order's `status` via `getStatusStep`/`ORDER_STATUS_STEPS`.
- **Real functional controls stay functional.** Order List's search/date/pickup/status filters are real, server-side, and already correct (from the prior order-list rebuild plan). Restyling their container to match the prototype's rounded/pill toolbar look must not remove or break any of that logic — inputs keep their existing `value`/`onChange` wiring.
- **No test runner.** Validation is `npx tsc --noEmit --pretty false`, `git diff --check`, and the manual browser QA steps spelled out per task — per project CLAUDE.md and this session's established pattern.
- Keep changes scoped to the files each task names. Don't touch data-fetching hooks, Supabase queries, or server actions.

---

## Phase A — Dashboard (`/dashboard`, แบบ D)

Source: `VariantD` in `src/app/prototype/nav-redesign/page.tsx` (lines 580-746), plus its `Metric` (lines 351-374) and `TodayTimeline` (lines 224-284) sub-components.

### Task 1: Restyle the dashboard header to match "Daily command center"

**Files:**
- Modify: `src/components/dashboard/DashboardPage.tsx`

**Interfaces:** None — this only changes the JSX between the existing `<h2>ภาพรวมคำสั่งซื้อ</h2>` header block and the `<DateRangeFilter />` line. All state (`isDark`, `range`, etc.) is unchanged.

- [ ] **Step 1: Replace the header block**

In `src/components/dashboard/DashboardPage.tsx`, replace:

```tsx
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
```

with:

```tsx
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">ภาพรวมคำสั่งซื้อ</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/8 dark:text-amber-300"
            aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Daily command center</p>
          <h2 className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">
            {orders.length} ออเดอร์กำลังดำเนินการ
          </h2>
        </div>
      </div>

      <DateRangeFilter value={range} onChange={setRange} />
```

Note: the loading/error/empty branches below still reference `orders.length` inside their own conditionals — this new headline sits above the `{errorMessage ? ... : isLoading ? ... : ...}` block, so on first render (before data loads) `orders` is `[]` and it reads "0 ออเดอร์กำลังดำเนินการ" briefly. That's acceptable — the loading skeleton covers the summary cards below it, and this headline is a lightweight, purely informational readout of already-fetched state, not a component needing its own skeleton.

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardPage.tsx
git commit -m "feat: restyle dashboard header to match prototype variant D"
```

---

### Task 2: Restyle `FinancialSummary` with icon badges (prototype's `Metric` card)

**Files:**
- Modify: `src/components/dashboard/FinancialSummary.tsx`

**Interfaces:** Props unchanged (`orderCount`, `bouquetTotal`, `deliveryTotal`, `grandTotal`, `dateHref`) — consumed the same way by `DashboardPage.tsx`.

- [ ] **Step 1: Replace the file**

```tsx
// src/components/dashboard/FinancialSummary.tsx
import Link from "next/link";
import { CalendarDays, Sparkles, Truck, BadgeCheck } from "lucide-react";

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
    { label: "ออเดอร์ทั้งหมด", value: String(orderCount), note: "ในช่วงที่เลือก", icon: CalendarDays },
    { label: "ยอดค่าช่อ", value: `฿${formatMoney(bouquetTotal)}`, note: "ไม่รวมค่าจัดส่ง", icon: Sparkles },
    { label: "ค่าจัดส่ง", value: `฿${formatMoney(deliveryTotal)}`, note: "เฉพาะออเดอร์จัดส่ง", icon: Truck },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={dateHref}
            className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-rose-200 dark:border-white/10 dark:bg-[#1a211c]"
          >
            <div className="mb-5 flex items-center justify-between text-sm text-stone-500 dark:text-stone-300">
              <span>{card.label}</span>
              <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-[#d85b80] dark:bg-rose-400/15 dark:text-rose-300">
                <Icon size={16} />
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-stone-800 dark:text-stone-100">{card.value}</p>
            <p className="mt-1 text-xs text-stone-400">{card.note}</p>
          </Link>
        );
      })}
      <Link
        href={dateHref}
        className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-300/20 dark:bg-[#4a2934]"
      >
        <div className="mb-5 flex items-center justify-between text-sm text-[#a14361] dark:text-rose-200">
          <span>ยอดทั้งหมด</span>
          <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#a14361] dark:bg-rose-200 dark:text-[#4a2934]">
            <BadgeCheck size={11} /> รวมสุทธิ
          </span>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-stone-800 dark:text-rose-50">
          ฿{formatMoney(grandTotal)}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-rose-100/65">ค่าช่อ + ค่าจัดส่ง</p>
      </Link>
    </section>
  );
};
```

- [ ] **Step 2: Remove the now-redundant `mb-4` wrapper in `DashboardPage.tsx`**

`FinancialSummary` used to render its own `<div className="mb-4 grid ...">` wrapper; it now renders a bare `<section className="grid ...">` with no bottom margin (matching the prototype, which relies on the parent's `mt-5` spacing on the next block instead). In `DashboardPage.tsx`, the `<FinancialSummary .../>` call site itself needs no change — but confirm the layout still reads correctly by checking Step 3 below adds spacing where needed. No file edit needed here beyond Task 1's already-applied header change; this step is a verification note, not a code change.

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 4: Manual QA (visual only, quick check)**

Run `npm run dev`, open `/dashboard`. Confirm each of the 4 cards shows a small rose icon badge in its top-right corner, and the 4th ("ยอดทั้งหมด") card shows a "รวมสุทธิ" pill instead of an icon. Confirm the cards no longer have a stray gap before the timeline/status row below them (Task 1's `mb-5` on the "Daily command center" line plus the existing `mt-4`/`grid gap-4` on the row below `FinancialSummary` in `DashboardPage.tsx` already provides spacing — no extra fix needed if it looks reasonable; if there's a visible double-gap or no-gap collision, add `className="mb-4"` back onto the `<section>` wrapper in `FinancialSummary.tsx` as a one-line fix).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/FinancialSummary.tsx
git commit -m "feat: add icon badges to dashboard FinancialSummary cards"
```

---

### Task 3: Restyle `TodayTimeline` to the prototype's column-header layout

**Files:**
- Modify: `src/components/dashboard/TodayTimeline.tsx`

**Interfaces:** Props unchanged (`orders: DashboardOrderRow[]`, `viewAllHref: string`).

- [ ] **Step 1: Replace the file**

```tsx
// src/components/dashboard/TodayTimeline.tsx
import Link from "next/link";
import { ChevronRight, MapPin, Store, Truck } from "lucide-react";
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
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c] sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">ลำดับงานวันนี้</h3>
          <p className="text-xs text-stone-400">Timeline ตามเวลานัดรับและจัดส่ง</p>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-[#cc5578] hover:underline dark:text-rose-300"
        >
          ดูทั้งหมด <ChevronRight size={15} />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
      ) : (
        <div className="relative before:absolute before:bottom-7 before:left-[57px] before:top-7 before:w-px before:bg-stone-200 dark:before:bg-white/15">
          <div className="mb-1 hidden grid-cols-[44px_14px_minmax(0,1fr)] gap-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:grid">
            <span className="text-right">เวลา</span>
            <span />
            <div className="grid grid-cols-[64px_minmax(90px,1fr)_minmax(110px,140px)_82px_112px_16px] gap-3 px-3">
              <span>ออเดอร์</span>
              <span>ลูกค้า</span>
              <span>สถานที่</span>
              <span>ยอด</span>
              <span>สถานะ</span>
              <span />
            </div>
          </div>

          {sorted.map((order) => {
            const isDelivery = order.pickup_mode === "delivery";
            const step = getStatusStep(order.status);
            const total = toNumber(order.bouquet_price) + (isDelivery ? getDeliveryPrice(order.delivery_info) : 0);
            const location = isDelivery ? "จัดส่ง" : "หน้าร้าน SweetPea";

            return (
              <Link
                key={order.id}
                href={`/order_list/${order.id}`}
                className="relative grid grid-cols-[44px_14px_minmax(0,1fr)] gap-3 py-2.5"
              >
                <b className="pt-3 text-right text-sm text-stone-700 dark:text-stone-200">
                  {order.delivery_time ? `${order.delivery_time}` : "-"}
                </b>
                <span
                  aria-hidden="true"
                  className={`z-10 mt-[17px] size-3 rounded-full ring-4 ring-white dark:ring-[#1a211c] ${
                    isDelivery ? "bg-amber-400" : "bg-[#dd5f83]"
                  }`}
                />
                <div className="grid min-h-16 min-w-0 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[64px_minmax(90px,1fr)_minmax(110px,140px)_82px_112px_16px] sm:items-center">
                  <b className="text-sm text-stone-800 dark:text-stone-100">#{order.order_no ?? order.id}</b>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                      {order.customer?.line_name || "-"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-stone-400">
                      {isDelivery ? <Truck size={12} /> : <Store size={12} />} {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
                    </p>
                  </div>
                  <span
                    title={location}
                    className="hidden min-w-0 items-center gap-1.5 text-sm text-stone-500 dark:text-stone-300 sm:flex"
                  >
                    <MapPin size={12} className="shrink-0 text-[#cc5578]" />
                    <span className="truncate">{location}</span>
                  </span>
                  <b className="text-sm tabular-nums text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</b>
                  {step && (
                    <span className={`badge ${step.badgeClass} w-full justify-center text-white`}>{step.label}</span>
                  )}
                  <ChevronRight size={14} className="hidden text-stone-300 sm:block dark:text-white/20" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/TodayTimeline.tsx
git commit -m "feat: restyle dashboard TodayTimeline to prototype variant D column layout"
```

---

### Task 4: Replace `StatusOverview` with the prototype's "สถานะงาน" combo card

The prototype doesn't have a separate 4-badge grid card — it has one card combining a big fraction ("14 / 18"), a percent-complete pill, and a 2×2 breakdown grid below it. Port that structure, computing real numbers from the existing 4-bucket aggregation (`DASHBOARD_STATUS_BUCKETS`/`getDashboardStatusBucket`, already built).

**Files:**
- Modify: `src/components/dashboard/StatusOverview.tsx`

**Interfaces:** Props unchanged (`counts: Record<OrderStatus, number>`).

- [ ] **Step 1: Replace the file**

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

  let totalOrders = 0;
  for (const step of ORDER_STATUS_STEPS) {
    const bucket = getDashboardStatusBucket(step.value);
    const count = counts[step.value] ?? 0;
    bucketCounts[bucket] += count;
    totalOrders += count;
  }

  const doneCount = bucketCounts.done ?? 0;
  const inProgressCount = totalOrders - doneCount;
  const percentInProgress = totalOrders > 0 ? Math.round((inProgressCount / totalOrders) * 100) : 0;

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-300/20 dark:bg-[#4a2934]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#a14361] dark:text-rose-200">สถานะงาน</p>
          <p className="mt-1 text-3xl font-semibold text-stone-800 dark:text-rose-50">
            {inProgressCount} / {totalOrders}
          </p>
          <p className="text-xs text-stone-500 dark:text-rose-100/65">กำลังดำเนินการ</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#a14361] dark:bg-rose-200 dark:text-[#4a2934]">
          {percentInProgress}%
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {DASHBOARD_STATUS_BUCKETS.map((bucket) => (
          <div key={bucket.key} className="rounded-xl bg-white/70 p-3 dark:bg-white/10">
            <b className="text-stone-800 dark:text-rose-50">{bucketCounts[bucket.key]}</b>
            <p className="text-[10px] text-stone-500 dark:text-rose-100/65">{bucket.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatusOverview.tsx
git commit -m "feat: redesign dashboard StatusOverview as combo fraction+breakdown card"
```

---

### Task 5: Minor polish on `DeliveryRounds` to match the prototype's clock-icon list

**Files:**
- Modify: `src/components/dashboard/DeliveryRounds.tsx`

**Interfaces:** Props unchanged (`orders: DashboardOrderRow[]`).

- [ ] **Step 1: Replace the file**

```tsx
// src/components/dashboard/DeliveryRounds.tsx
import { Clock3, Truck } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">รอบจัดส่ง</h3>
        <Truck size={16} className="text-[#cc5578] dark:text-rose-300" />
      </div>
      {sortedRounds.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">ไม่มีรอบจัดส่งในช่วงเวลานี้</p>
      ) : (
        sortedRounds.map(([time, count]) => (
          <div
            key={time}
            className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 dark:border-white/10"
          >
            <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#cc5578] dark:bg-rose-400/15 dark:text-rose-300">
              <Clock3 size={13} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{time} น.</p>
              <p className="text-xs text-stone-400">{count} ออเดอร์</p>
            </div>
          </div>
        ))
      )}
    </section>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DeliveryRounds.tsx
git commit -m "feat: polish DeliveryRounds icon style to match prototype variant D"
```

---

### Task 6: QA the dashboard phase

**Files:** none (verification only).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit --pretty false`
Expected: zero errors.

- [ ] **Step 2: Manual QA**

Run `npm run dev`, open `/dashboard`.

- Confirm the "Daily command center" / "N ออเดอร์กำลังดำเนินการ" headline appears above the date-range filter.
- Confirm the 4 financial cards show icon badges (calendar/sparkle/truck) and the "ยอดทั้งหมด" card shows a "รวมสุทธิ" pill.
- Confirm the timeline shows column headers (เวลา/ออเดอร์/ลูกค้า/สถานที่/ยอด/สถานะ) on desktop width, and each row shows a location cell with a map-pin icon.
- Confirm the right column shows the "สถานะงาน" combo card (fraction + percent pill + 2×2 breakdown) above "รอบจัดส่ง", both restyled with rose icon badges.
- Toggle dark mode; confirm every new element (icon badges, the rose "สถานะงาน" card, "รวมสุทธิ" pill) has a correct dark-mode counterpart with no unstyled white/black flash.
- Confirm clicking any financial card, "ดูทั้งหมด", or a timeline row still navigates correctly (unchanged behavior — no functional edit was made to any handler).

- [ ] **Step 3: Commit (if QA turns up fixes)**

```bash
git add -A
git commit -m "fix: address dashboard phase-A visual QA findings"
```

---

## Phase B — Order List (`/order_list`, แบบ D)

Source: `VariantD` in `src/app/prototype/order-list/page.tsx` (lines 512-672), plus `Toolbar` (lines 242-268), `OrderProgress`/`Status` (lines 200-241).

### Task 7: Restyle the header and add a functional "วันนี้" quick-filter button

**Files:**
- Modify: `src/app/order_list/page.tsx`
- Modify: `src/components/orderlist/OrderListFilterBar.tsx`

**Interfaces:**
- `OrderListFilterBar` gains no new props — the "วันนี้" button is implemented inside it using the existing `pushParams` helper, setting `deliveryDate` to today's local date.

- [ ] **Step 1: Add a `toTodayParam` helper and a "วันนี้" button to `OrderListFilterBar.tsx`**

Add near the top of `src/components/orderlist/OrderListFilterBar.tsx` (after the existing imports, before `type OrderListFilterBarProps`):

```tsx
import { CalendarDays } from "lucide-react";
```

(add `CalendarDays` to the existing `import { Search, X } from "lucide-react";` line instead — change that line to:)

```tsx
import { CalendarDays, Search, X } from "lucide-react";
```

Add this helper right after the `PICKUP_OPTIONS` constant:

```ts
const toTodayParam = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
```

- [ ] **Step 2: Insert the button into the toolbar row**

In the same file, find the toolbar `<div className="flex flex-wrap items-center gap-3 ...">` block. Insert this button immediately after the closing `</label>` of the search input and before the `<input type="date" ...>`:

```tsx
        <button
          type="button"
          onClick={() => pushParams({ deliveryDate: toTodayParam() })}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5"
        >
          <CalendarDays size={16} /> วันนี้
        </button>
```

- [ ] **Step 3: Restyle the `order_list/page.tsx` header to match the prototype's plainer header row**

In `src/app/order_list/page.tsx`, replace:

```tsx
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
```

with:

```tsx
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
          รายการคำสั่งซื้อ <span className="text-sm font-normal text-stone-400">({totalCount})</span>
        </h2>
        <div className="flex items-center gap-2">
          <OrderListThemeToggle />
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
        </div>
      </div>
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 5: Manual QA**

Run `npm run dev`, open `/order_list`. Click "วันนี้"; confirm the URL gains `?deliveryDate=<today>` and the list/summary/chip row update to match (chip shows "วันที่ <today>").

- [ ] **Step 6: Commit**

```bash
git add src/app/order_list/page.tsx src/components/orderlist/OrderListFilterBar.tsx
git commit -m "feat: restyle order-list header, add วันนี้ quick-filter button"
```

---

### Task 8: Restyle `OrderListSummaryCards` to match the prototype's 3-card summary

**Files:**
- Modify: `src/components/orderlist/OrderListSummaryCards.tsx`

**Interfaces:** Props unchanged (`orders: OrderRecord[]`).

- [ ] **Step 1: Replace the file**

```tsx
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

  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">คิวที่แสดง</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">
          {orders.length} <span className="text-sm font-normal text-stone-400">ออเดอร์</span>
        </p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">จัดส่ง</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">
          {deliveryCount} <span className="text-sm font-normal text-stone-400">รอบ</span>
        </p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
        <p className="text-xs text-stone-400">ยอดรวม</p>
        <p className="mt-1 text-2xl font-semibold text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</p>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/orderlist/OrderListSummaryCards.tsx
git commit -m "feat: restyle OrderListSummaryCards to match prototype variant D"
```

---

### Task 9: Add the quick-filter pill row above the timeline

The prototype shows a horizontal row of pill buttons ("ทั้งหมด / วันนี้ / รับที่ร้าน / จัดส่ง / ยังไม่สำเร็จ") between the summary cards and the date-grouped list. Make these real, functional quick filters — each one sets the same URL params the existing filter bar already reads, so state stays in one place (the URL).

**Files:**
- Create: `src/components/orderlist/OrderListQuickFilters.tsx`
- Modify: `src/app/order_list/page.tsx`

**Interfaces:**
- Produces: `OrderListQuickFilters` with props `{ searchParams: OrderListSearchParams }` — consumed by `order_list/page.tsx`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/orderlist/OrderListQuickFilters.tsx
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
```

- [ ] **Step 2: Wire it into `order_list/page.tsx`**

Add the import:

```tsx
import { OrderListQuickFilters } from "@/components/orderlist/OrderListQuickFilters";
```

Insert `<OrderListQuickFilters searchParams={params} />` immediately after `<OrderListSummaryCards orders={orders} />`:

```tsx
      <OrderListSummaryCards orders={orders} />

      <OrderListQuickFilters searchParams={params} />

      <OrderListTimeline orders={orders} />
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 4: Manual QA**

Click each pill; confirm the URL and the list/chips update correctly, and the correct pill highlights as active (dark background) after navigation. Confirm "ทั้งหมด" always clears every filter including search text (note: it does NOT clear `q`, matching the prototype's own quick filters which are pickup/date/status only — the search box has its own "ล้างตัวกรอง" in the filter bar for clearing everything including search. If this feels wrong in practice, that's a legitimate UX call to flag back, not a bug to silently fix).

- [ ] **Step 5: Commit**

```bash
git add src/components/orderlist/OrderListQuickFilters.tsx src/app/order_list/page.tsx
git commit -m "feat: add order-list quick-filter pill row matching prototype variant D"
```

---

### Task 10: Restyle the date-group header bar

**Files:**
- Modify: `src/components/orderlist/OrderListTimeline.tsx`

**Interfaces:** Props unchanged (`orders: OrderRecord[]`).

- [ ] **Step 1: Replace the date-group header and outer wrapper**

In `src/components/orderlist/OrderListTimeline.tsx`, replace the whole return block with:

```tsx
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a211c]">
      {sortedKeys.map((key) => {
        const groupOrders = [...(groups.get(key) ?? [])].sort((a, b) => {
          if (!a.delivery_time) return 1;
          if (!b.delivery_time) return -1;
          return a.delivery_time.localeCompare(b.delivery_time);
        });

        return (
          <div key={key}>
            <div className="flex items-center justify-between border-y border-stone-100 bg-stone-50 px-4 py-3 first:border-t-0 dark:border-white/8 dark:bg-white/5 sm:px-5">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#d34f77]" />
                <b className="text-sm text-stone-800 dark:text-stone-100">
                  {key === UNSCHEDULED_KEY ? "ยังไม่ระบุวันนัด" : formatDateHeading(key)}
                </b>
                <span className="text-xs text-stone-400">{groupOrders.length} ออเดอร์</span>
              </div>
              {key !== UNSCHEDULED_KEY && <span className="text-xs text-stone-400">เรียงตามเวลานัดรับ</span>}
            </div>

            <div className="relative px-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-stone-200 dark:before:bg-white/10 sm:px-5">
              <ol className="space-y-3 py-3">
                {groupOrders.map((order) => (
                  <li key={order.id} className="relative pl-5">
                    <span
                      className={`absolute -left-[1px] top-3 grid size-5 place-items-center rounded-full ring-4 ring-white dark:ring-[#1a211c] ${
                        order.pickup_mode === "delivery" ? "bg-amber-500" : "bg-[#dd5f83]"
                      }`}
                    >
                      {order.pickup_mode === "delivery" ? (
                        <Truck size={11} className="text-white" />
                      ) : (
                        <Store size={11} className="text-white" />
                      )}
                    </span>
                    <OrderTimelineCard order={order} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </section>
  );
};
```

Add `CalendarDays` to the existing icon import at the top of the file — change:

```tsx
import { Store, Truck } from "lucide-react";
```

to:

```tsx
import { CalendarDays, Store, Truck } from "lucide-react";
```

The empty-state branch at the top of the component (`if (orders.length === 0) { return (...) }`) is unchanged — leave it as-is.

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/orderlist/OrderListTimeline.tsx
git commit -m "feat: restyle order-list date-group header bar to match prototype variant D"
```

---

### Task 11: Restyle `OrderTimelineCard` to the prototype's grid columns

**Files:**
- Modify: `src/components/orderlist/OrderTimelineCard.tsx`

**Interfaces:** Props unchanged (`order: OrderRecord`).

- [ ] **Step 1: Replace the card's outer className and internal grid**

In `src/components/orderlist/OrderTimelineCard.tsx`, replace the `return (...)` block with:

```tsx
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
      className="grid min-w-0 cursor-pointer grid-cols-1 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4 outline-none transition hover:border-rose-200 focus-visible:ring-2 focus-visible:ring-[#dd5f83] dark:border-white/8 dark:bg-white/5 md:grid-cols-[64px_72px_minmax(0,1fr)_105px_90px_120px_20px] md:items-center"
    >
      <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
        {order.delivery_time ? `${order.delivery_time} น.` : "-"}
        {isOverdue && (
          <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            เลยเวลา
          </span>
        )}
      </span>

      <b className="text-sm text-stone-800 dark:text-stone-100">#{order.order_no ?? order.id}</b>

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
          {order.customer?.line_name || "-"}
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

      <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
        {isDelivery ? <Truck size={14} /> : <Store size={14} />}
        {isDelivery ? "จัดส่ง" : "รับที่ร้าน"}
      </span>

      <b className="text-sm tabular-nums text-stone-800 dark:text-stone-100">฿{formatMoney(total)}</b>

      {step && <span className={`badge ${step.badgeClass} w-full justify-center text-white`}>{step.label}</span>}

      <ChevronRight size={16} className="hidden text-stone-300 md:block dark:text-white/20" />
    </div>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/orderlist/OrderTimelineCard.tsx
git commit -m "feat: restyle OrderTimelineCard grid to match prototype variant D"
```

---

### Task 12: Numbered-page pagination

**Files:**
- Modify: `src/components/orderlist/OrderListPagination.tsx`

**Interfaces:** Props unchanged (`page`, `pageSize`, `totalCount`, `searchParams`).

- [ ] **Step 1: Replace the file**

```tsx
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

// At most 5 page-number buttons, centered on the current page where possible.
const visiblePages = (page: number, totalPages: number) => {
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
};

export const OrderListPagination = ({ page, pageSize, totalCount, searchParams }: OrderListPaginationProps) => {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);
  const pages = visiblePages(page, totalPages);

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
      <span>
        แสดง {from}–{to} จาก {totalCount} รายการ
      </span>
      <div className="flex gap-1">
        <Link
          href={buildHref(Math.max(1, page - 1), searchParams)}
          aria-disabled={page <= 1}
          className={`rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 ${
            page <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          ก่อนหน้า
        </Link>
        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p, searchParams)}
            className={
              p === page
                ? "rounded-lg bg-stone-900 px-3 py-2 text-white dark:bg-white dark:text-stone-900"
                : "rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
            }
          >
            {p}
          </Link>
        ))}
        <Link
          href={buildHref(Math.min(totalPages, page + 1), searchParams)}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 ${
            page >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
        >
          ถัดไป
        </Link>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 3: Manual QA**

With more than 25 orders in the database (confirm current seed data has 26), open `/order_list`; confirm page-number buttons `1` and `2` both render, the current page is highlighted dark, and clicking either navigates correctly while preserving active filters.

- [ ] **Step 4: Commit**

```bash
git add src/components/orderlist/OrderListPagination.tsx
git commit -m "feat: switch order-list pagination to numbered page buttons"
```

---

### Task 13: QA the order-list phase

**Files:** none (verification only).

- [ ] **Step 1: Full checks**

Run: `npx tsc --noEmit --pretty false`, `git diff --check`
Expected: no errors, no output.

- [ ] **Step 2: Manual QA**

Run `npm run dev`, open `/order_list`.

- Confirm the header, summary cards, quick-filter pill row, date-group headers, and order cards all visually match the prototype's variant D layout (rounded pill buttons, table-like card grid, date-group header bar with calendar icon).
- Re-run the full functional checklist from the prior order-list plan's QA (search by name/order-number/phone, date/pickup/status filters, chip removal, pagination, dark mode, keyboard Enter navigation on a card) to confirm none of this phase's styling changes broke any of it — this phase touched only JSX/className, but confirm nothing regressed.
- Confirm clicking an order card still opens `/order_list/[orderId]` (the full `OrderDetailWorkspace`, not a slide-over).

- [ ] **Step 3: Commit (if QA turns up fixes)**

```bash
git add -A
git commit -m "fix: address order-list phase-B visual QA findings"
```

---

## Phase C — Order Form (`/order_form`, แบบ B)

The real `OrderFormWizard` (`src/components/formorder/OrderFormWizard.tsx`) already implements the guided-steps structure per `docs/superpowers/ui/new-order.md`'s 5-step design (ลูกค้า → ช่อดอกไม้ → รูปแบบและการ์ด → การรับสินค้า → ตรวจสอบ), which is itself the approved, source-of-truth elaboration of the raw prototype's 4-step `VariantB` (`src/app/prototype/order-form/page.tsx`, which merges wrap/card into the flower step). Its `StepProgress` component (`src/components/formorder/StepProgress.tsx`) already mirrors the prototype's step-circle/connector-line style. The one visible gap: the prototype shows a large icon-in-a-circle heading above each step's content (`WizardHeading`); the real wizard has no equivalent. This phase adds just that.

### Task 14: Add per-step icon headings matching the prototype's `WizardHeading`

**Files:**
- Create: `src/components/formorder/WizardStepHeading.tsx`
- Modify: `src/components/formorder/OrderFormWizard.tsx`

**Interfaces:**
- Produces: `WizardStepHeading` with props `{ icon: React.ReactNode; title: string; note: string }` — consumed by `OrderFormWizard.tsx`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/formorder/WizardStepHeading.tsx
type WizardStepHeadingProps = {
  icon: React.ReactNode;
  title: string;
  note: string;
};

export const WizardStepHeading = ({ icon, title, note }: WizardStepHeadingProps) => (
  <div className="mb-6 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#d34f77] dark:bg-rose-400/15 dark:text-rose-300 [&>svg]:size-6">
      {icon}
    </span>
    <h2 className="mt-4 text-xl font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
    <p className="mt-1 text-sm text-stone-400">{note}</p>
  </div>
);
```

- [ ] **Step 2: Add a heading above each step in `OrderFormWizard.tsx`**

Add the import and an icon import:

```tsx
import { ArrowLeft, ChevronRight, FileText, Gift, Truck, UserRound } from "lucide-react";
import { WizardStepHeading } from "./WizardStepHeading";
```

(replace the existing `import { ArrowLeft, ChevronRight } from "lucide-react";` line with the combined one above.)

Wrap each step's field component with a heading. Change:

```tsx
          {step === 0 && (
            <CustomerFields
```

to:

```tsx
          {step === 0 && (
            <>
              <WizardStepHeading
                icon={<UserRound />}
                title="ลูกค้าคนนี้คือใคร?"
                note="ใช้สำหรับติดต่อและค้นหาออเดอร์ภายหลัง"
              />
              <CustomerFields
```

...and close the added fragment right before the step's closing `)}`. Concretely, the full step-0 block becomes:

```tsx
          {step === 0 && (
            <>
              <WizardStepHeading
                icon={<UserRound />}
                title="ลูกค้าคนนี้คือใคร?"
                note="ใช้สำหรับติดต่อและค้นหาออเดอร์ภายหลัง"
              />
              <CustomerFields
                lineName={state.lineName}
                phone={state.phone}
                note={state.note}
                onLineNameChange={state.setLineName}
                onPhoneChange={state.setPhone}
                onNoteChange={state.setNote}
              />
            </>
          )}
```

Apply the same wrapping pattern to the remaining steps, each with this heading content:

Step 1 (`FlowerItemsFields`):
```tsx
              <WizardStepHeading icon={<Gift />} title="จัดช่อแบบไหนดี?" note="เพิ่มดอกไม้ได้สูงสุด 4 ชนิด" />
```

Step 2 (`WrapAndCardFields`):
```tsx
              <WizardStepHeading
                icon={<Gift />}
                title="ห่อช่อและการ์ดแบบไหน?"
                note="เลือกกระดาษห่อ สีโบว์ และข้อความการ์ด (ถ้ามี)"
              />
```

Step 3 (`FulfilmentFields`):
```tsx
              <WizardStepHeading icon={<Truck />} title="ลูกค้าจะรับช่ออย่างไร?" note="กำหนดรูปแบบ วัน และเวลานัดรับ" />
```

Step 4 (the review step, above the existing `<div className="space-y-5">`):
```tsx
              <WizardStepHeading
                icon={<FileText />}
                title="ตรวจสอบก่อนบันทึก"
                note="เช็กข้อมูลให้ครบ แล้วบันทึกและพิมพ์ใบออเดอร์"
              />
```

For step 4, since its content is already wrapped in a `<div className="space-y-5">`, put the heading as the first child inside that div rather than adding a new fragment:

```tsx
          {step === 4 && (
            <div className="space-y-5">
              <WizardStepHeading
                icon={<FileText />}
                title="ตรวจสอบก่อนบันทึก"
                note="เช็กข้อมูลให้ครบ แล้วบันทึกและพิมพ์ใบออเดอร์"
              />
              <OrderSummaryCard lineName={state.lineName} rows={state.flower.rows} flower={state.flower} />
              <UploadPic
                onSaveOrder={(images) => state.saveOrder(images)}
                onPrintOrder={onPrintOrder}
                statusMessage={statusMessage}
              />
            </div>
          )}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit --pretty false`
Expected: no errors.

- [ ] **Step 4: Manual QA**

Run `npm run dev`, open `/order_form`. Step through all 5 steps; confirm each shows a centered rose icon circle with a title and note above its fields, matching the prototype's `WizardHeading` style. Confirm the wizard's existing behavior (validation, back/next, save, print) is unaffected — this task only adds a heading, no logic changed.

- [ ] **Step 5: Commit**

```bash
git add src/components/formorder/WizardStepHeading.tsx src/components/formorder/OrderFormWizard.tsx
git commit -m "feat: add per-step icon headings to OrderFormWizard matching prototype variant B"
```

---

## Task 15: Final validation pass across all three phases

**Files:** none (verification only).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit --pretty false`
Expected: zero errors.

- [ ] **Step 2: Whitespace/diff check**

Run: `git diff --check`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors beyond the three pre-existing ones already documented from earlier sessions (`FileuploaderActual.tsx`, `useOrderFormState.ts`, `Navbar2.tsx`).

- [ ] **Step 4: Cross-phase regression check**

Manually re-open all three pages (`/dashboard`, `/order_list`, `/order_form`) end-to-end: create an order via the (now icon-headed) wizard, confirm it appears correctly in the restyled order-list timeline and the restyled dashboard's "ลำดับงานวันนี้"/financial cards for the right date, then open its detail page and print it. This exercises every phase's changes together against real data.

- [ ] **Step 5: Commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address cross-phase issues found in final validation pass"
```
