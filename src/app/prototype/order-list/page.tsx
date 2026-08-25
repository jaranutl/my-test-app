"use client";

// Three order-list prototypes, switchable via ?variant=, on /prototype/order-list.
// Critique — broken: mock data/actions; matters: density and workflow are testable, query behavior is not; bulletproof: winner rebuilt with paginated Supabase data and tablet QA.
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronRight,
  CirclePlus,
  Clock3,
  LayoutDashboard,
  ListFilter,
  ImageIcon,
  Moon,
  Search,
  ShoppingBag,
  Store,
  Sun,
  Truck,
  Upload,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

type VariantKey = "A" | "B" | "C" | "D";
type Order = {
  no: string;
  customer: string;
  phone: string;
  time: string;
  date: string;
  pickup: "รับที่ร้าน" | "จัดส่ง";
  total: number;
  status: "รอชำระ" | "รับออเดอร์แล้ว" | "กำลังจัดช่อ" | "พร้อมรับ" | "สำเร็จ";
};
const variants: { key: VariantKey; name: string }[] = [
  { key: "A", name: "Operations table" },
  { key: "B", name: "Status board" },
  { key: "C", name: "Pickup timeline" },
  { key: "D", name: "Schedule table" },
];
const orders: Order[] = [
  {
    no: "#1058",
    customer: "คุณมินท์",
    phone: "089-245-7781",
    time: "10:30",
    date: "24 ส.ค.",
    pickup: "จัดส่ง",
    total: 1890,
    status: "กำลังจัดช่อ",
  },
  {
    no: "#1057",
    customer: "Ploy S.",
    phone: "081-642-9032",
    time: "12:00",
    date: "24 ส.ค.",
    pickup: "รับที่ร้าน",
    total: 950,
    status: "พร้อมรับ",
  },
  {
    no: "#1056",
    customer: "คุณต้น",
    phone: "086-318-4410",
    time: "14:30",
    date: "24 ส.ค.",
    pickup: "จัดส่ง",
    total: 2450,
    status: "รอชำระ",
  },
  {
    no: "#1055",
    customer: "Baitoey",
    phone: "092-507-1189",
    time: "16:00",
    date: "24 ส.ค.",
    pickup: "รับที่ร้าน",
    total: 1290,
    status: "รับออเดอร์แล้ว",
  },
  {
    no: "#1054",
    customer: "คุณฟ้า",
    phone: "099-184-5207",
    time: "09:00",
    date: "25 ส.ค.",
    pickup: "จัดส่ง",
    total: 1750,
    status: "รับออเดอร์แล้ว",
  },
  {
    no: "#1053",
    customer: "Mew M.",
    phone: "088-711-2904",
    time: "11:30",
    date: "25 ส.ค.",
    pickup: "รับที่ร้าน",
    total: 890,
    status: "สำเร็จ",
  },
];
const tones: Record<Order["status"], string> = {
  รอชำระ: "bg-rose-50 text-rose-700 dark:bg-rose-400/12 dark:text-rose-300",
  รับออเดอร์แล้ว: "bg-sky-50 text-sky-700 dark:bg-sky-400/12 dark:text-sky-300",
  กำลังจัดช่อ:
    "bg-amber-50 text-amber-700 dark:bg-amber-400/12 dark:text-amber-300",
  พร้อมรับ:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
  สำเร็จ: "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300",
};

function Shell({
  children,
  dark,
  toggle,
}: {
  children: React.ReactNode;
  dark: boolean;
  toggle: () => void;
}) {
  return (
    <div
      className={
        dark
          ? "dark flex min-h-screen bg-[#121713] text-stone-100"
          : "flex min-h-screen bg-[#faf9f7] text-stone-800"
      }
    >
      <aside className="hidden w-14 shrink-0 flex-col items-center border-r border-stone-200 bg-white dark:border-white/10 dark:bg-[#1a211c] md:flex">
        <div className="grid h-16 place-items-center">
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
        </div>
        <nav className="mt-4 flex flex-col gap-2">
          {[LayoutDashboard, ShoppingBag, CirclePlus].map((Icon, i) => (
            <span
              key={i}
              className={`grid size-10 place-items-center rounded-xl ${i === 1 ? "bg-rose-50 text-[#d34f77] dark:bg-rose-400/12 dark:text-rose-300" : "text-stone-400"}`}
            >
              <Icon size={19} />
            </span>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#1a211c] lg:px-8">
          <div>
            <p className="text-xs text-stone-400">คำสั่งซื้อ / ทั้งหมด</p>
            <h1 className="text-lg font-semibold">รายการคำสั่งซื้อ</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggle}
              className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 dark:border-white/10 dark:bg-white/8 dark:text-amber-300"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 text-sm font-semibold text-white">
              <CirclePlus size={17} />{" "}
              <span className="hidden sm:inline">เพิ่มออเดอร์</span>
            </button>
          </div>
        </header>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-17 grid-cols-3 border-t border-stone-200 bg-white dark:border-white/10 dark:bg-[#1a211c] md:hidden">
        {[
          [LayoutDashboard, "ภาพรวม"],
          [ShoppingBag, "รายการ"],
          [CirclePlus, "เพิ่มใหม่"],
        ].map(([Icon, label], i) => {
          const I = Icon as typeof ShoppingBag;
          return (
            <span
              key={label as string}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] ${i === 1 ? "text-[#d34f77]" : "text-stone-400"}`}
            >
              <I size={20} />
              {label as string}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
function Status({ value }: { value: Order["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[value]}`}
    >
      {value}
    </span>
  );
}
const progressSteps: Order["status"][] = [
  "รอชำระ",
  "รับออเดอร์แล้ว",
  "กำลังจัดช่อ",
  "พร้อมรับ",
  "สำเร็จ",
];
function OrderProgress({ value }: { value: Order["status"] }) {
  const current = progressSteps.indexOf(value);
  return (
    <div className="min-w-24">
      <Status value={value} />
      <div
        className="mt-2 flex items-center"
        aria-label={`ความคืบหน้า ${current + 1} จาก ${progressSteps.length}`}
      >
        {progressSteps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <span
              title={step}
              className={`size-2 shrink-0 rounded-full transition-all ${index < current ? "bg-[#dd5f83]" : index === current ? "scale-125 bg-[#dd5f83] ring-2 ring-rose-100 dark:ring-rose-400/15" : "bg-stone-200 dark:bg-white/15"}`}
            />
            {index < progressSteps.length - 1 && (
              <span
                className={`h-px min-w-2 flex-1 ${index < current ? "bg-[#dd5f83]" : "bg-stone-200 dark:bg-white/15"}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function Toolbar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-stone-400 dark:border-white/10 dark:bg-white/5">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-white"
          placeholder="ค้นหาเลขออเดอร์ ชื่อลูกค้า หรือเบอร์โทร"
        />
      </label>
      <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5">
        <CalendarDays size={16} /> วันนี้
      </button>
      <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5">
        <ListFilter size={16} /> ตัวกรอง
      </button>
    </div>
  );
}

export function VariantA({
  data,
  query,
  setQuery,
}: {
  data: Order[];
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-8">
      <Toolbar query={query} setQuery={setQuery} />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          "ทั้งหมด 128",
          "วันนี้ 18",
          "รอชำระ 7",
          "กำลังจัดช่อ 4",
          "พร้อมรับ 3",
        ].map((x, i) => (
          <button
            key={x}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${i === 0 ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900" : "border border-stone-200 bg-white text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <section className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a211c]">
        <div className="hidden grid-cols-[80px_1fr_100px_110px_100px_150px_32px] bg-stone-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:bg-white/5 md:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Pickup</span>
          <span>Method</span>
          <span>Total</span>
          <span>Progress</span>
          <span />
        </div>
        {data.map((o) => (
          <div
            key={o.no}
            className="grid grid-cols-[68px_1fr_auto] items-center gap-3 border-t border-stone-100 px-4 py-4 first:border-0 dark:border-white/8 md:grid-cols-[80px_1fr_100px_110px_100px_150px_32px] md:px-5"
          >
            <b className="text-sm">{o.no}</b>
            <div>
              <p className="text-sm font-medium">{o.customer}</p>
              <p className="text-xs text-stone-400">{o.phone}</p>
            </div>
            <span className="hidden text-sm md:block">{o.time}</span>
            <span className="hidden text-sm text-stone-500 dark:text-stone-300 md:block">
              {o.pickup}
            </span>
            <b className="hidden text-sm md:block">
              ฿{o.total.toLocaleString()}
            </b>
            <OrderProgress value={o.status} />
            <ChevronRight
              size={16}
              className="hidden text-stone-300 md:block"
            />
          </div>
        ))}
        {data.length === 0 && (
          <p className="p-10 text-center text-sm text-stone-400">
            ไม่พบออเดอร์
          </p>
        )}
      </section>
      <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
        <span>แสดง 1–25 จาก 128 รายการ</span>
        <div className="flex gap-1">
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            ก่อนหน้า
          </button>
          <button className="rounded-lg bg-stone-900 px-3 py-2 text-white dark:bg-white dark:text-stone-900">
            1
          </button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            2
          </button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}

export function VariantB({
  data,
  query,
  setQuery,
}: {
  data: Order[];
  query: string;
  setQuery: (v: string) => void;
}) {
  const groups: [Order["status"], string][] = [
    ["รอชำระ", "Payment"],
    ["รับออเดอร์แล้ว", "Inbox"],
    ["กำลังจัดช่อ", "Making"],
    ["พร้อมรับ", "Ready"],
  ];
  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Toolbar query={query} setQuery={setQuery} />
        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          {groups.map(([status, en]) => {
            const items = data.filter((o) => o.status === status);
            return (
              <section
                key={status}
                className="rounded-2xl bg-stone-100/70 p-3 dark:bg-white/5"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-sm font-semibold">{status}</h2>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">
                      {en}
                    </p>
                  </div>
                  <span className="grid size-7 place-items-center rounded-full bg-white text-xs dark:bg-white/10">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((o) => (
                    <article
                      key={o.no}
                      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a211c]"
                    >
                      <div className="flex justify-between">
                        <b className="text-sm">{o.no}</b>
                        <span className="text-xs text-stone-400">{o.time}</span>
                      </div>
                      <p className="mt-3 text-sm font-medium">{o.customer}</p>
                      <p className="text-xs text-stone-400">{o.pickup}</p>
                      <div className="mt-4 flex items-end justify-between">
                        <b>฿{o.total.toLocaleString()}</b>
                        <ChevronRight size={16} className="text-stone-300" />
                      </div>
                      <div className="mt-4 border-t border-stone-100 pt-3 dark:border-white/8">
                        <OrderProgress value={o.status} />
                      </div>
                    </article>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-xs text-stone-400 dark:border-white/10">
                      ไม่มีออเดอร์
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function VariantC({
  data,
  query,
  setQuery,
}: {
  data: Order[];
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[280px_1fr] lg:p-8">
      <aside className="space-y-4">
        <Toolbar query={query} setQuery={setQuery} />
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
          <p className="text-xs text-stone-400">คิววันนี้</p>
          <p className="mt-1 text-4xl font-semibold">{data.length}</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>รับที่ร้าน</span>
              <b>{data.filter((o) => o.pickup === "รับที่ร้าน").length}</b>
            </div>
            <div className="flex justify-between">
              <span>จัดส่ง</span>
              <b>{data.filter((o) => o.pickup === "จัดส่ง").length}</b>
            </div>
            <div className="flex justify-between">
              <span>ยอดรวม</span>
              <b>฿{data.reduce((a, o) => a + o.total, 0).toLocaleString()}</b>
            </div>
          </div>
        </section>
      </aside>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400">วันจันทร์ 24 สิงหาคม</p>
            <h2 className="text-xl font-semibold">ตารางรับช่อและจัดส่ง</h2>
          </div>
          <Clock3 size={20} className="text-stone-400" />
        </div>
        <div className="relative space-y-0 before:absolute before:bottom-4 before:left-[51px] before:top-4 before:w-px before:bg-stone-200 dark:before:bg-white/10">
          {data.map((o) => (
            <article
              key={o.no}
              className="relative grid grid-cols-[52px_14px_1fr] gap-3 py-3"
            >
              <b className="text-sm">{o.time}</b>
              <span
                className={`z-10 mt-1.5 size-3 rounded-full ring-4 ring-white dark:ring-[#1a211c] ${o.pickup === "จัดส่ง" ? "bg-amber-400" : "bg-[#dd5f83]"}`}
              />
              <div className="flex flex-col justify-between gap-3 rounded-xl bg-stone-50 p-4 dark:bg-white/5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <b>{o.no}</b>
                    <span className="text-sm font-medium">{o.customer}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                    {o.pickup === "จัดส่ง" ? (
                      <Truck size={13} />
                    ) : (
                      <Store size={13} />
                    )}{" "}
                    {o.pickup} · {o.phone}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <b>฿{o.total.toLocaleString()}</b>
                  <OrderProgress value={o.status} />
                  <ChevronRight size={16} className="text-stone-300" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function VariantD({
  data,
  query,
  setQuery,
}: {
  data: Order[];
  query: string;
  setQuery: (v: string) => void;
}) {
  const [selectedNo, setSelectedNo] = useState<string | null>(null);
  const [statusByNo, setStatusByNo] = useState<Record<string, Order["status"]>>(
    {},
  );
  const [finishedPhotoByNo, setFinishedPhotoByNo] = useState<
    Record<string, string>
  >({});
  const [pendingPhotoStatus, setPendingPhotoStatus] = useState<
    Order["status"] | null
  >(null);
  const viewData = data.map((order) => ({
    ...order,
    status: statusByNo[order.no] ?? order.status,
  }));
  const selectedOrder = viewData.find((order) => order.no === selectedNo);
  const selectedFinishedPhoto = selectedOrder
    ? finishedPhotoByNo[selectedOrder.no]
    : undefined;
  const dates = Array.from(new Set(viewData.map((order) => order.date)));
  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-8">
      <Toolbar query={query} setQuery={setQuery} />
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
          <p className="text-xs text-stone-400">คิวที่แสดง</p>
          <p className="mt-1 text-2xl font-semibold">
            {viewData.length}{" "}
            <span className="text-sm font-normal text-stone-400">ออเดอร์</span>
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
          <p className="text-xs text-stone-400">จัดส่ง</p>
          <p className="mt-1 text-2xl font-semibold">
            {viewData.filter((o) => o.pickup === "จัดส่ง").length}{" "}
            <span className="text-sm font-normal text-stone-400">รอบ</span>
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a211c]">
          <p className="text-xs text-stone-400">ยอดรวม</p>
          <p className="mt-1 text-2xl font-semibold">
            ฿{viewData.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
          </p>
        </div>
      </section>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {["ทั้งหมด", "วันนี้", "รับที่ร้าน", "จัดส่ง", "ยังไม่สำเร็จ"].map(
          (label, index) => (
            <button
              key={label}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${index === 0 ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900" : "border border-stone-200 bg-white text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"}`}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <section className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a211c]">
        {dates.map((date) => (
          <div key={date}>
            <div className="flex items-center justify-between border-y border-stone-100 bg-stone-50 px-4 py-3 first:border-t-0 dark:border-white/8 dark:bg-white/5 sm:px-5">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#d34f77]" />
                <b className="text-sm">{date}</b>
                <span className="text-xs text-stone-400">
                  {viewData.filter((o) => o.date === date).length} ออเดอร์
                </span>
              </div>
              <span className="text-xs text-stone-400">เรียงตามเวลานัดรับ</span>
            </div>
            <div className="relative px-4 before:absolute before:bottom-6 before:left-[73px] before:top-6 before:w-px before:bg-stone-200 dark:before:bg-white/10 sm:px-5 sm:before:left-[77px]">
              {viewData
                .filter((o) => o.date === date)
                .map((order) => (
                  <article
                    key={order.no}
                    role="button"
                    tabIndex={0}
                    aria-label={`เปิด ${order.no} เพื่ออัปเดตสถานะ`}
                    onClick={() => {
                      setSelectedNo(order.no);
                      setPendingPhotoStatus(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedNo(order.no);
                        setPendingPhotoStatus(null);
                      }
                    }}
                    className="relative grid cursor-pointer grid-cols-[48px_14px_minmax(0,1fr)] gap-3 rounded-xl py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#dd5f83]"
                  >
                    <div className="pt-3 text-right">
                      <b className="block text-sm">{order.time}</b>
                      <span className="text-[10px] text-stone-400">น.</span>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`z-10 mt-[18px] size-3 rounded-full ring-4 ring-white dark:ring-[#1a211c] ${order.pickup === "จัดส่ง" ? "bg-amber-400" : "bg-[#dd5f83]"}`}
                    />
                    <div className="grid min-w-0 gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4 dark:border-white/8 dark:bg-white/5 md:grid-cols-[72px_minmax(0,1fr)_105px_90px_150px_20px] md:items-center">
                      <b className="text-sm">{order.no}</b>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {order.customer}
                        </p>
                        <p className="truncate text-xs text-stone-400">
                          {order.phone}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-300">
                        {order.pickup === "จัดส่ง" ? (
                          <Truck size={14} />
                        ) : (
                          <Store size={14} />
                        )}{" "}
                        {order.pickup}
                      </span>
                      <b className="text-sm">฿{order.total.toLocaleString()}</b>
                      <OrderProgress value={order.status} />
                      <ChevronRight
                        size={16}
                        className="hidden text-stone-300 md:block"
                      />
                    </div>
                  </article>
                ))}
            </div>
          </div>
        ))}
        {viewData.length === 0 && (
          <p className="p-10 text-center text-sm text-stone-400">
            ไม่พบออเดอร์
          </p>
        )}
      </section>
      <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
        <span>แสดง 1–25 จาก 128 รายการ</span>
        <div className="flex gap-1">
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            ก่อนหน้า
          </button>
          <button className="rounded-lg bg-stone-900 px-3 py-2 text-white dark:bg-white dark:text-stone-900">
            1
          </button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            2
          </button>
          <button className="rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            ถัดไป
          </button>
        </div>
      </div>
      {selectedOrder && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-stone-950/30 backdrop-blur-[1px]"
          onClick={() => {
            setSelectedNo(null);
            setPendingPhotoStatus(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="progress-title"
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-[#1a211c]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-stone-400">{selectedOrder.no}</p>
                <h2 id="progress-title" className="mt-1 text-xl font-semibold">
                  รายละเอียดและความคืบหน้า
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-300">
                  {selectedOrder.customer} · {selectedOrder.time} น.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedNo(null);
                  setPendingPhotoStatus(null);
                }}
                className="grid size-9 place-items-center rounded-full border border-stone-200 text-lg dark:border-white/10"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>
            <section className="mt-6">
              <h3 className="text-sm font-semibold">
                รูปแบบช่อที่ลูกค้าต้องการ
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr]">
                <div className="relative grid min-h-44 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 dark:from-rose-400/20 dark:via-white/5 dark:to-amber-300/10">
                  <div
                    className="text-center"
                    aria-label="รูปอ้างอิงช่อดอกไม้โทนชมพูขาว"
                  >
                    <p className="text-6xl">💐</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] text-stone-500 dark:bg-black/20 dark:text-stone-300">
                      <ImageIcon size={11} /> รูปอ้างอิงลูกค้า
                    </span>
                  </div>
                </div>
                <dl className="grid content-start gap-3 rounded-2xl border border-stone-200 p-4 text-sm dark:border-white/10">
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-400">ดอกไม้</dt>
                    <dd className="text-right font-medium">
                      กุหลาบชมพู 12, คาร์เนชั่นขาว 6, ยิปโซ
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-400">โทนสี</dt>
                    <dd className="font-medium">ชมพูอ่อน · ขาว</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-400">กระดาษห่อ</dt>
                    <dd className="font-medium">เกาหลีสีครีม</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-400">โบว์</dt>
                    <dd className="font-medium">ซาตินสีชมพู</dd>
                  </div>
                  <div className="border-t border-stone-100 pt-3 dark:border-white/10">
                    <dt className="text-stone-400">ข้อความการ์ด</dt>
                    <dd className="mt-1 whitespace-pre-wrap font-medium">
                      ขอให้วันนี้เป็นวันที่สดใสนะ :)
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
            {(pendingPhotoStatus || selectedFinishedPhoto) && (
              <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-300/20 dark:bg-rose-400/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      ถ่ายรูปช่อก่อนเปลี่ยนเป็น{" "}
                      {pendingPhotoStatus || "พร้อมรับ"}
                    </h3>
                    <p className="mt-1 text-xs text-stone-400">
                      ส่วนนี้แสดงเมื่อเลือกสถานะพร้อมรับ/พร้อมส่งเท่านั้น
                    </p>
                  </div>
                  <Camera size={16} className="text-[#d34f77]" />
                </div>
                {selectedFinishedPhoto ? (
                  <div className="relative mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-300/20 dark:bg-emerald-400/10">
                    <div className="relative h-56">
                      <Image
                        fill
                        unoptimized
                        src={selectedFinishedPhoto}
                        alt={`รูปช่อที่จัดเสร็จสำหรับ ${selectedOrder.no}`}
                        className="object-cover"
                      />
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                      ✓ บันทึกรูปช่อแล้ว
                    </span>
                  </div>
                ) : (
                  <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-rose-300 bg-rose-50/50 p-5 text-center transition hover:bg-rose-50 dark:border-rose-300/30 dark:bg-rose-400/8">
                    <Upload size={18} className="text-[#d34f77]" />
                    <span className="mt-2 text-sm font-medium">
                      ถ่ายรูปหรือเลือกรูปช่อดอกไม้
                    </span>
                    <span className="mt-1 text-xs text-stone-400">
                      JPG, PNG หรือ HEIC
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setFinishedPhotoByNo((current) => ({
                          ...current,
                          [selectedOrder.no]: URL.createObjectURL(file),
                        }));
                        if (pendingPhotoStatus) {
                          setStatusByNo((current) => ({
                            ...current,
                            [selectedOrder.no]: pendingPhotoStatus,
                          }));
                          setPendingPhotoStatus(null);
                        }
                      }}
                    />
                  </label>
                )}
              </section>
            )}
            <h3 className="mt-6 text-sm font-semibold">อัปเดตความคืบหน้า</h3>
            <div className="mt-6 space-y-2">
              {progressSteps.map((step, index) => {
                const active = selectedOrder.status === step;
                const completed =
                  progressSteps.indexOf(selectedOrder.status) > index;
                const needsFinishedPhoto =
                  (step === "พร้อมรับ" || step === "สำเร็จ") &&
                  !selectedFinishedPhoto &&
                  progressSteps.indexOf(selectedOrder.status) <
                    progressSteps.indexOf("พร้อมรับ");
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      if (needsFinishedPhoto) {
                        setPendingPhotoStatus(step);
                        return;
                      }
                      setPendingPhotoStatus(null);
                      setStatusByNo((current) => ({
                        ...current,
                        [selectedOrder.no]: step,
                      }));
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${pendingPhotoStatus === step ? "border-rose-300 bg-rose-50 dark:bg-rose-400/10" : ""} ${active ? "border-[#dd5f83] bg-rose-50 text-[#b44767] dark:bg-rose-400/12 dark:text-rose-300" : "border-stone-200 hover:border-rose-200 dark:border-white/10 dark:hover:border-rose-300/30"}`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${completed || active ? "bg-[#dd5f83] text-white" : "bg-stone-100 text-stone-400 dark:bg-white/10"}`}
                    >
                      {completed ? "✓" : index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{step}</span>
                    {active && <span className="text-xs">ปัจจุบัน</span>}
                    {needsFinishedPhoto && (
                      <Camera size={13} aria-label="ต้องมีรูปช่อก่อน" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              Prototype: การเปลี่ยนสถานะเก็บในหน่วยความจำเท่านั้น
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Switcher({
  current,
  onChange,
}: {
  current: VariantKey;
  onChange: (v: VariantKey) => void;
}) {
  const i = variants.findIndex((v) => v.key === current);
  const move = useCallback(
    (n: number) =>
      onChange(variants[(i + n + variants.length) % variants.length].key),
    [i, onChange],
  );
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) ||
        t.isContentEditable
      )
        return;
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [move]);
  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/90 p-1.5 text-white shadow-2xl md:bottom-5">
      <button
        onClick={() => move(-1)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowLeft size={15} />
      </button>
      <span className="min-w-38 text-center text-xs">
        <b>{current}</b> — {variants[i].name}
      </span>
      <button
        onClick={() => move(1)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
function OrderListPrototypeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("variant")?.toUpperCase();
  const current: VariantKey =
    raw === "B" || raw === "C" || raw === "D" ? raw : "A";
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const data = useMemo(
    () =>
      orders.filter((o) =>
        `${o.no} ${o.customer} ${o.phone}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const onChange = useCallback(
    (key: VariantKey) => {
      const p = new URLSearchParams(params.toString());
      p.set("variant", key);
      router.replace(`?${p}`, { scroll: false });
    },
    [params, router],
  );
  return (
    <Shell dark={dark} toggle={() => setDark((v) => !v)}>
      {current === "A" && (
        <VariantA data={data} query={query} setQuery={setQuery} />
      )}{" "}
      {current === "B" && (
        <VariantB data={data} query={query} setQuery={setQuery} />
      )}{" "}
      {current === "C" && (
        <VariantC data={data} query={query} setQuery={setQuery} />
      )}{" "}
      {current === "D" && (
        <VariantD data={data} query={query} setQuery={setQuery} />
      )}{" "}
      {process.env.NODE_ENV !== "production" && (
        <Switcher current={current} onChange={onChange} />
      )}
    </Shell>
  );
}
export default function OrderListPrototype() {
  return (
    <Suspense>
      <OrderListPrototypeContent />
    </Suspense>
  );
}
