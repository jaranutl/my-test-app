"use client";

// Unified gallery for reviewing every operational-page mock in one place.
// Critique — broken: iframe previews do not prove cross-page state; matters: visual consistency only; bulletproof: promote winners, share real shell/state, run tablet E2E.
import { ExternalLink, LayoutDashboard, Maximize2, ShoppingBag, SquarePlus } from "lucide-react";
import { useState } from "react";

const pages = [
  {
    key: "dashboard",
    title: "ภาพรวมคำสั่งซื้อ",
    note: "Dashboard · แบบ D ผสาน A+B แยกค่าช่อ ค่าจัดส่ง และยอดทั้งหมด",
    href: "/prototype/nav-redesign?variant=D",
    icon: LayoutDashboard,
  },
  {
    key: "orders",
    title: "รายการคำสั่งซื้อ",
    note: "Order list · Hybrid ตารางปฏิบัติงาน + pickup timeline",
    href: "/prototype/order-list?variant=D",
    icon: ShoppingBag,
  },
  {
    key: "form",
    title: "เพิ่มรายการใหม่",
    note: "Order form · Design B แบบ guided steps",
    href: "/prototype/order-form?variant=B",
    icon: SquarePlus,
  },
  {
    key: "detail",
    title: "รายละเอียดคำสั่งซื้อ",
    note: "Order detail · 3 layouts using order #35 data",
    href: "/prototype/order-detail?variant=A",
    icon: ShoppingBag,
  },
] as const;

type PageKey = (typeof pages)[number]["key"];

export default function PrototypeGallery() {
  const [active, setActive] = useState<PageKey>("dashboard");
  const [device, setDevice] = useState<"tablet" | "desktop">("tablet");
  const page = pages.find((item) => item.key === active) ?? pages[0];
  const Icon = page.icon;

  return (
    <div className="compact-ui-icons fixed inset-0 z-50 overflow-auto bg-[#f2f1ee] text-stone-800">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d34f77]">Sweet Pea & Co. prototype gallery</p>
            <h1 className="mt-1 text-xl font-semibold">ตัวอย่าง Mock ทุกหน้า</h1>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {pages.map(({ key, title, icon: NavIcon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  active === key
                    ? "bg-stone-900 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                }`}
              >
                <NavIcon size={16} /> {title}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-4 lg:p-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-[#d34f77]"><Icon size={19} /></span>
            <div><h2 className="font-semibold">{page.title}</h2><p className="text-xs text-stone-400">{page.note}</p></div>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-xl border border-stone-200 bg-white p-1">
              {(["tablet", "desktop"] as const).map((value) => (
                <button key={value} onClick={() => setDevice(value)} className={`rounded-lg px-3 py-1.5 text-xs ${device === value ? "bg-stone-900 text-white" : "text-stone-400"}`}>{value === "tablet" ? "Tablet 1024" : "Desktop 1440"}</button>
              ))}
            </div>
            <a href={page.href} className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50" title="เปิดหน้าเต็ม"><ExternalLink size={17} /></a>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-stone-300 bg-[#d9d7d2] p-3 shadow-xl sm:p-5">
          <div className={`mx-auto overflow-hidden rounded-xl border border-stone-300 bg-white shadow-2xl transition-[width] ${device === "tablet" ? "w-full max-w-[1024px]" : "w-[1440px]"}`}>
            <div className="flex h-9 items-center gap-2 border-b border-stone-200 bg-stone-100 px-3">
              <span className="size-2.5 rounded-full bg-[#ff605c]"/><span className="size-2.5 rounded-full bg-[#ffbd44]"/><span className="size-2.5 rounded-full bg-[#00ca4e]"/>
              <span className="mx-auto flex items-center gap-1 rounded-md bg-white px-4 py-1 text-[10px] text-stone-400"><Maximize2 size={10}/>{page.href}</span>
            </div>
            <iframe key={`${page.key}-${device}`} title={`${page.title} mock preview`} src={page.href} className="h-[720px] w-full bg-white" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map(({ key, title, note, href, icon: CardIcon }) => (
            <button key={key} onClick={() => setActive(key)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active === key ? "border-[#df6688] bg-rose-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active === key ? "bg-[#df6688] text-white" : "bg-stone-100 text-stone-400"}`}><CardIcon size={18}/></span>
              <span className="min-w-0"><b className="block text-sm">{title}</b><small className="block truncate text-stone-400">{note}</small><small className="mt-1 block font-mono text-[9px] text-stone-300">{href}</small></span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
