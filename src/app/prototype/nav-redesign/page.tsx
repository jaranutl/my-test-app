"use client";

// Three variants of the shared order workspace, switchable via ?variant=, on /prototype/nav-redesign.
// Critique — broken: static data/actions; matters: cannot validate real workflow; bulletproof: winner rebuilt with live queries, mutations, visual QA.
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Clock3,
  LayoutDashboard,
  ListFilter,
  MapPin,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  Truck,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";

type VariantKey = "A" | "B" | "C" | "D";

const variants: { key: VariantKey; name: string }[] = [
  { key: "A", name: "Quiet workspace" },
  { key: "B", name: "Daily command center" },
  { key: "C", name: "Order-first rail" },
  { key: "D", name: "A + B dashboard" },
];

const navItems = [
  { label: "ภาพรวม", href: "/dashboard", icon: LayoutDashboard },
  { label: "รายการคำสั่งซื้อ", href: "/order_list", icon: ShoppingBag },
  { label: "เพิ่มรายการใหม่", href: "/order_form", icon: CirclePlus },
];

const orders = [
  {
    id: "#1058",
    customer: "คุณมินท์",
    time: "10:30",
    type: "จัดส่ง",
    location: "โรงพยาบาลกรุงเทพ",
    total: "1,890",
    status: "กำลังจัดช่อ",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    id: "#1057",
    customer: "Ploy S.",
    time: "12:00",
    type: "รับที่ร้าน",
    location: "หน้าร้าน Sweet Pea & Co.",
    total: "950",
    status: "พร้อมรับ",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "#1056",
    customer: "คุณต้น",
    time: "14:30",
    type: "จัดส่ง",
    location: "อาคาร Gaysorn Tower",
    total: "2,450",
    status: "รอชำระ",
    tone: "bg-rose-50 text-rose-700",
  },
  {
    id: "#1055",
    customer: "Baitoey",
    time: "16:00",
    type: "รับที่ร้าน",
    location: "หน้าร้าน Sweet Pea & Co.",
    total: "1,290",
    status: "รับออเดอร์แล้ว",
    tone: "bg-sky-50 text-sky-700",
  },
];

function DesktopRail({
  dark = false,
  expanded = false,
}: {
  dark?: boolean;
  expanded?: boolean;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={`hidden shrink-0 flex-col border-r md:flex ${expanded ? "w-60 px-4" : "w-14 items-center"} ${dark ? "border-white/10 bg-[#17211b] text-white" : "border-stone-200 bg-white text-stone-700"}`}
    >
      <div
        className={`flex h-16 items-center ${expanded ? "gap-3 px-2" : "justify-center"}`}
      >
        <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-rose-100 dark:bg-[#f7eee9]">
          <Image
            src="/SweetPea&Co_logo.png"
            alt="Sweet Pea & Co. logo"
            width={40}
            height={40}
            priority
            className="size-full object-contain"
          />
        </span>
        {expanded && (
          <div>
            <p className="font-semibold leading-none">Sweet Pea & Co.</p>
            <p
              className={`mt-1 text-[11px] ${dark ? "text-white/50" : "text-stone-400"}`}
            >
              flower studio
            </p>
          </div>
        )}
      </div>
      <nav
        className={`mt-4 flex w-full flex-col gap-2 ${expanded ? "" : "items-center"}`}
      >
        {navItems.map(({ label, href, icon: Icon }, index) => {
          const active = pathname === href || index === 0;
          return (
            <Link
              title={label}
              key={href}
              href={href}
              className={`group relative flex h-11 items-center rounded-xl transition ${expanded ? "gap-3 px-3" : "w-10 justify-center"} ${active ? (dark ? "bg-[#f3c95f] text-[#17211b]" : "bg-rose-50 text-[#d34f77]") : dark ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}
            >
              <Icon size={19} />
              {expanded && <span className="text-sm font-medium">{label}</span>}
              {!expanded && (
                <span className="pointer-events-none absolute left-12 z-20 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto mb-5 grid size-9 place-items-center rounded-full bg-[#f7d9df] text-xs font-semibold text-[#b44767]">
        SP
      </div>
    </aside>
  );
}

function MobileNav({ dark = false }: { dark?: boolean }) {
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-30 grid h-17 grid-cols-3 border-t px-2 pb-[env(safe-area-inset-bottom)] md:hidden ${dark ? "border-white/10 bg-[#17211b] text-white" : "border-stone-200 bg-white text-stone-500"}`}
    >
      {navItems.map(({ label, href, icon: Icon }, index) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] ${index === 0 ? (dark ? "text-[#f3c95f]" : "text-[#d34f77]") : ""}`}
        >
          <Icon size={20} />
          <span>
            {label
              .replace("รายการคำสั่งซื้อ", "รายการ")
              .replace("เพิ่มรายการใหม่", "เพิ่มใหม่")}
          </span>
        </Link>
      ))}
    </nav>
  );
}

function OrderRows({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="divide-y divide-stone-100 dark:divide-white/10">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`grid items-center gap-3 py-3 ${compact ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[auto_1fr_auto] sm:grid-cols-[70px_1fr_90px_100px_90px_auto]"}`}
        >
          <span className="text-sm font-semibold">{order.id}</span>
          <div>
            <p className="text-sm font-medium">{order.customer}</p>
            {compact && (
              <p
                className={`text-xs ${dark ? "text-stone-400" : "text-stone-400"}`}
              >
                {order.time} · {order.type}
              </p>
            )}
          </div>
          {!compact && (
            <>
              <span className="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">
                {order.time}
              </span>
              <span className="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">
                {order.type}
              </span>
              <span className="hidden text-sm font-medium sm:block">
                ฿{order.total}
              </span>
            </>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-center text-[11px] font-medium ${order.tone}`}
          >
            {order.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function TodayTimeline() {
  return (
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
      {orders.map((order) => (
        <article
          key={order.id}
          className="relative grid grid-cols-[44px_14px_minmax(0,1fr)] gap-3 py-2.5"
        >
          <b className="pt-3 text-right text-sm">{order.time}</b>
          <span
            aria-hidden="true"
            className={`z-10 mt-[17px] size-3 rounded-full ring-4 ring-white dark:ring-[#202a23] ${order.type === "จัดส่ง" ? "bg-amber-400" : "bg-[#dd5f83]"}`}
          />
          <div className="grid min-h-16 min-w-0 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[64px_minmax(90px,1fr)_minmax(110px,140px)_82px_112px_16px] sm:items-center">
            <b className="text-sm">{order.id}</b>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{order.customer}</p>
              <p className="flex items-center gap-1 text-xs text-stone-400">
                {order.type === "จัดส่ง" ? (
                  <Truck size={12} />
                ) : (
                  <Store size={12} />
                )}{" "}
                {order.type}
              </p>
            </div>
            <span
              title={order.location}
              className="hidden min-w-0 items-center gap-1.5 text-sm text-stone-500 dark:text-stone-300 sm:flex"
            >
              <MapPin size={12} className="shrink-0 text-[#cc5578]" />
              <span className="truncate">{order.location}</span>
            </span>
            <b className="text-sm tabular-nums">฿{order.total}</b>
            <span
              className={`w-full rounded-full px-2 py-1 text-center text-[11px] font-medium ${order.tone}`}
            >
              {order.status}
            </span>
            <ChevronRight
              size={14}
              className="hidden text-stone-300 sm:block"
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export function VariantA() {
  return (
    <div className="flex min-h-screen bg-[#faf9f7] text-stone-800">
      <DesktopRail />
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-5 lg:px-9">
          <div>
            <p className="text-xs text-stone-400">วันอาทิตย์ที่ 23 สิงหาคม</p>
            <h1 className="font-semibold">สวัสดี, Sweet Pea & Co.</h1>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-medium text-white shadow-sm">
            <CirclePlus size={17} /> เพิ่มออเดอร์
          </button>
        </header>
        <div className="mx-auto max-w-6xl p-5 lg:p-9">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-stone-500">ภาพรวมวันนี้</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                ร้านกำลังไปได้สวย
              </h2>
            </div>
            <button className="flex w-fit items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
              <CalendarDays size={16} /> วันนี้
            </button>
          </div>
          <section className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="ออเดอร์ทั้งหมด"
              value="18"
              note="+4 จากเมื่อวาน"
              icon={<ShoppingBag />}
            />
            <Metric
              label="ยอดขาย"
              value="฿24,680"
              note="เฉลี่ย ฿1,371 / ออเดอร์"
              icon={<Sparkles />}
            />
            <Metric
              label="รอจัดส่ง"
              value="6"
              note="รอบถัดไป 10:30 น."
              icon={<Truck />}
            />
          </section>
          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">ออเดอร์วันนี้</h3>
                <p className="text-xs text-stone-400">เรียงตามเวลานัดรับ</p>
              </div>
              <button className="flex items-center gap-1 text-sm font-medium text-[#cc5578]">
                ดูทั้งหมด <ChevronRight size={16} />
              </button>
            </div>
            <OrderRows />
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#202a23]">
      <div className="mb-5 flex items-center justify-between text-sm text-stone-500 dark:text-stone-300">
        <span>{label}</span>
        <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-[#d85b80] dark:bg-rose-400/15 dark:text-rose-300 [&>svg]:size-18">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-stone-400">{note}</p>
    </div>
  );
}

export function VariantB() {
  return (
    <div className="flex min-h-screen bg-[#eef1e8] text-[#17211b]">
      <DesktopRail dark expanded />
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="flex items-center justify-between px-5 py-5 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#6b766d]">
              Sunday studio briefing
            </p>
            <h1 className="mt-1 text-3xl font-semibold">
              วันนี้ต้องส่งอะไรบ้าง?
            </h1>
          </div>
          <button className="grid size-11 place-items-center rounded-full bg-[#17211b] text-white">
            <Search size={18} />
          </button>
        </header>
        <div className="grid gap-5 px-5 lg:grid-cols-[1.45fr_.75fr] lg:px-10">
          <section className="overflow-hidden rounded-[28px] bg-[#17211b] p-6 text-white lg:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">คิววันนี้</p>
                <p className="mt-2 text-5xl font-semibold">18</p>
                <p className="mt-1 text-sm text-white/50">orders in motion</p>
              </div>
              <span className="rounded-full bg-[#f3c95f] px-3 py-1 text-xs font-semibold text-[#17211b]">
                6 ต้องส่ง
              </span>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-2">
              {[7, 4, 3, 4].map((n, i) => (
                <div key={i} className="rounded-2xl bg-white/8 p-3">
                  <p className="text-xl font-semibold">{n}</p>
                  <p className="mt-1 text-[10px] text-white/45">
                    {["รับแล้ว", "จัดช่อ", "พร้อมรับ", "สำเร็จ"][i]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">ลำดับถัดไป</h2>
                <span className="text-xs text-white/45">Live queue</span>
              </div>
              <OrderRows compact dark />
            </div>
          </section>
          <aside className="space-y-5">
            <button className="flex w-full items-center justify-between rounded-[24px] bg-[#f3c95f] p-5 text-left">
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider opacity-60">
                  Quick action
                </span>
                <span className="mt-1 block text-xl font-semibold">
                  สร้างออเดอร์ใหม่
                </span>
              </span>
              <CirclePlus size={28} />
            </button>
            <div className="rounded-[24px] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">รอบจัดส่ง</h2>
                <Truck size={18} className="text-[#6b766d]" />
              </div>
              {[
                ["10:30", "2 ออเดอร์"],
                ["14:30", "3 ออเดอร์"],
                ["17:00", "1 ออเดอร์"],
              ].map(([time, count]) => (
                <div
                  key={time}
                  className="mt-4 flex items-center gap-3 border-t border-stone-100 pt-4"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[#eef1e8]">
                    <Clock3 size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{time} น.</p>
                    <p className="text-xs text-stone-400">{count}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <MobileNav dark />
    </div>
  );
}

export function VariantC() {
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <DesktopRail />
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="border-b border-slate-200 px-5 py-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Store size={15} /> Sweet Pea & Co. Operations
              </div>
              <h1 className="mt-1 text-2xl font-bold">รายการคำสั่งซื้อ</h1>
            </div>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 lg:w-72">
                <Search size={16} />
                <input
                  className="w-full outline-none"
                  placeholder="ค้นหาเลขออเดอร์หรือลูกค้า"
                />
              </label>
              <button className="rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">
                + เพิ่มใหม่
              </button>
            </div>
          </div>
        </header>
        <div className="p-5 lg:p-8">
          <div className="mb-5 flex gap-2 overflow-x-auto">
            {[
              "ทั้งหมด 128",
              "วันนี้ 18",
              "รอชำระ 7",
              "กำลังจัดช่อ 4",
              "พร้อมรับ 3",
            ].map((label, i) => (
              <button
                key={label}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${i === 0 ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-500"}`}
              >
                {label}
              </button>
            ))}
            <button className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs">
              <ListFilter size={14} /> ตัวกรอง
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden grid-cols-[80px_1fr_110px_120px_100px_120px_30px] bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid">
              <span>Order</span>
              <span>Customer</span>
              <span>Pickup</span>
              <span>Method</span>
              <span>Total</span>
              <span>Status</span>
              <span />
            </div>
            {orders
              .concat(orders.map((o, i) => ({ ...o, id: `#105${4 - i}` })))
              .map((order, i) => (
                <div
                  key={`${order.id}-${i}`}
                  className="grid grid-cols-[70px_1fr_auto] items-center gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 sm:grid-cols-[80px_1fr_110px_120px_100px_120px_30px] sm:px-5"
                >
                  <span className="text-sm font-bold">{order.id}</span>
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-slate-400">LINE customer</p>
                  </div>
                  <span className="hidden text-sm sm:block">{order.time}</span>
                  <span className="hidden text-sm text-slate-500 sm:block">
                    {order.type}
                  </span>
                  <span className="hidden text-sm font-semibold sm:block">
                    ฿{order.total}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-center text-[11px] font-medium ${order.tone}`}
                  >
                    {order.status}
                  </span>
                  <ChevronRight
                    size={15}
                    className="hidden text-slate-300 sm:block"
                  />
                </div>
              ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>แสดง 1–8 จาก 128 รายการ</span>
            <div className="flex gap-1">
              <button className="rounded border border-slate-200 px-2 py-1">
                ก่อนหน้า
              </button>
              <button className="rounded bg-slate-900 px-2.5 py-1 text-white">
                1
              </button>
              <button className="rounded border border-slate-200 px-2.5 py-1">
                2
              </button>
              <button className="rounded border border-slate-200 px-2 py-1">
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

export function VariantD() {
  const [dark, setDark] = useState(false);
  const bouquetRevenue = 22_430;
  const deliveryRevenue = 2_250;
  const totalRevenue = bouquetRevenue + deliveryRevenue;

  return (
    <div
      className={
        dark
          ? "dark flex min-h-screen bg-[#161d18] text-stone-100"
          : "flex min-h-screen bg-[#faf9f7] text-stone-800"
      }
    >
      <DesktopRail dark={dark} expanded />
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#202a23] lg:px-9">
          <div>
            <p className="text-xs text-stone-400">วันอาทิตย์ที่ 23 สิงหาคม</p>
            <h1 className="font-semibold">ภาพรวมร้านวันนี้</h1>
          </div>
          <div className="flex gap-2">
            <button
              aria-label={dark ? "ใช้ธีมสว่าง" : "ใช้ธีมมืด"}
              onClick={() => setDark((value) => !value)}
              className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 dark:border-white/10 dark:bg-[#2a362d] dark:text-amber-300"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-semibold text-white">
              <CirclePlus size={16} /> เพิ่มออเดอร์
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 lg:p-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Daily command center
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                18 ออเดอร์กำลังดำเนินการ
              </h2>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#202a23]">
              <CalendarDays size={15} /> วันนี้
            </button>
          </div>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="ออเดอร์ทั้งหมด"
              value="18"
              note="6 รายการต้องจัดส่ง"
              icon={<ShoppingBag />}
            />
            <Metric
              label="ยอดค่าช่อ"
              value={`฿${bouquetRevenue.toLocaleString()}`}
              note="ไม่รวมค่าจัดส่ง"
              icon={<Sparkles />}
            />
            <Metric
              label="ค่าจัดส่ง"
              value={`฿${deliveryRevenue.toLocaleString()}`}
              note="จาก 6 รอบจัดส่ง"
              icon={<Truck />}
            />
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-300/20 dark:bg-[#4a2934]">
              <div className="mb-5 flex items-center justify-between text-sm text-[#a14361] dark:text-rose-200">
                <span>ยอดทั้งหมด</span>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#a14361] dark:bg-rose-200 dark:text-[#4a2934]">
                  รวมสุทธิ
                </span>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                ฿{totalRevenue.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-rose-100/65">
                ค่าช่อ + ค่าจัดส่ง
              </p>
            </div>
          </section>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_320px]">
            <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#202a23] sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">ลำดับงานวันนี้</h3>
                  <p className="text-xs text-stone-400">
                    Timeline ตามเวลานัดรับและจัดส่ง
                  </p>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-[#cc5578] dark:text-rose-300">
                  ดูทั้งหมด <ChevronRight size={15} />
                </button>
              </div>
              <TodayTimeline />
            </section>
            <aside className="space-y-4">
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-300/20 dark:bg-[#4a2934]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#a14361] dark:text-rose-200">
                      สถานะงาน
                    </p>
                    <p className="mt-1 text-3xl font-semibold">14 / 18</p>
                    <p className="text-xs text-stone-500 dark:text-rose-100/65">
                      กำลังดำเนินการ
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#a14361] dark:bg-rose-200 dark:text-[#4a2934]">
                    78%
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    ["รับแล้ว", "7"],
                    ["จัดช่อ", "4"],
                    ["พร้อมรับ", "3"],
                    ["สำเร็จ", "4"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-white/70 p-3 dark:bg-white/10"
                    >
                      <b>{value}</b>
                      <p className="text-[10px] text-stone-500 dark:text-rose-100/65">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#202a23]">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">รอบจัดส่ง</h3>
                  <Truck
                    size={16}
                    className="text-[#cc5578] dark:text-rose-300"
                  />
                </div>
                {[
                  ["10:30", "2 ออเดอร์"],
                  ["14:30", "3 ออเดอร์"],
                  ["17:00", "1 ออเดอร์"],
                ].map(([time, count]) => (
                  <div
                    key={time}
                    className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 dark:border-white/10"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#cc5578] dark:bg-rose-400/15 dark:text-rose-300">
                      <Clock3 size={13} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{time} น.</p>
                      <p className="text-xs text-stone-400">{count}</p>
                    </div>
                  </div>
                ))}
              </section>
            </aside>
          </div>
        </div>
      </main>
      <MobileNav dark={dark} />
    </div>
  );
}

function PrototypeSwitcher({
  current,
  onChange,
}: {
  current: VariantKey;
  onChange: (key: VariantKey) => void;
}) {
  const index = variants.findIndex((item) => item.key === current);
  const move = useCallback(
    (step: number) =>
      onChange(
        variants[(index + step + variants.length) % variants.length].key,
      ),
    [index, onChange],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);
  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/90 p-1.5 text-white shadow-2xl backdrop-blur md:bottom-5">
      <button
        aria-label="Previous variant"
        onClick={() => move(-1)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowLeft size={15} />
      </button>
      <span className="min-w-38 text-center text-xs">
        <b>{current}</b> — {variants[index].name}
      </span>
      <button
        aria-label="Next variant"
        onClick={() => move(1)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function NavRedesignPrototypeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get("variant")?.toUpperCase();
  const current: VariantKey =
    raw === "A" || raw === "B" || raw === "C" ? raw : "D";
  const onChange = useCallback(
    (key: VariantKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", key);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  return (
    <div className="compact-ui-icons fixed inset-0 z-50 overflow-auto bg-white">
      {current === "A" && <VariantA />}
      {current === "B" && <VariantB />}
      {current === "C" && <VariantC />}
      {current === "D" && <VariantD />}
      {process.env.NODE_ENV !== "production" && (
        <PrototypeSwitcher current={current} onChange={onChange} />
      )}
    </div>
  );
}

export default function NavRedesignPrototype() {
  return (
    <Suspense>
      <NavRedesignPrototypeContent />
    </Suspense>
  );
}
