"use client";

// Three order-detail prototypes, switchable via ?variant=, on /prototype/order-detail.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Flower2,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Pencil,
  Phone,
  Printer,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";

type VariantKey = "A" | "B" | "C";

const variants: { key: VariantKey; name: string }[] = [
  { key: "A", name: "Split workspace" },
  { key: "B", name: "Bouquet story" },
  { key: "C", name: "Operations timeline" },
];

const order = {
  no: 35,
  status: "กำลังจัดช่อ",
  customer: "nick",
  phone: "098-765-4443",
  date: "14 สิงหาคม 2569",
  time: "16:30 น.",
  recipient: "tom",
  recipientPhone: "087-654-6832",
  address: "สีชมพู",
  map: "https://maps.app.goo.gl/MBHbkovnBqfEdnx78",
  flowers: ["กุหลาบ · ชมพู × 1", "ลิลลี่ · ขาว × 1"],
  paper: "Crimson",
  bow: "Crimson",
  card: "hbd",
  bouquet: 8000,
  delivery: 70,
};

const steps = ["รับออเดอร์แล้ว", "กำลังจัดช่อ", "กำลังห่อช่อ", "พร้อมรับ", "กำลังจัดส่ง", "จัดส่งสำเร็จ"];

function StatusSteps({ vertical = false }: { vertical?: boolean }) {
  const current = 1;
  return (
    <div className={vertical ? "space-y-2" : "grid grid-cols-3 gap-y-4 sm:grid-cols-6"}>
      {steps.map((label, index) => (
        <div key={label} className={vertical ? "flex items-center gap-3" : "relative flex flex-col items-center gap-2 text-center"}>
          <span className={`z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold ${index < current ? "border-[#dd5f83] bg-[#dd5f83] text-white" : index === current ? "border-[#dd5f83] bg-white text-[#dd5f83]" : "border-stone-200 bg-[#faf9f7] text-stone-300"}`}>
            {index < current ? <Check size={14} /> : index + 1}
          </span>
          <span className={`text-[11px] ${index === current ? "font-semibold text-stone-800" : "text-stone-400"}`}>{label}</span>
          {!vertical && index < steps.length - 1 && <span className={`absolute left-1/2 top-4 h-0.5 w-full ${index < current ? "bg-[#dd5f83]" : "bg-stone-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function BouquetPlaceholder({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`grid place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 ${tall ? "min-h-[420px]" : "min-h-56"}`}>
      <div className="text-center">
        <p className="text-7xl">💐</p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs text-stone-500"><Sparkles size={12} /> รูปตัวอย่างลูกค้า</span>
      </div>
    </div>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-5 py-3 lg:px-9">
      <div className="flex items-center gap-3">
        <Link href="/order_list/35" className="grid size-10 place-items-center rounded-xl border border-stone-200 text-stone-500"><ArrowLeft size={17} /></Link>
        <div><p className="text-xs text-stone-400">รายการคำสั่งซื้อ / #{order.no}</p><h1 className="font-semibold">{title}</h1></div>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"><Printer size={15} /> พิมพ์</button>
        <button className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white"><Pencil size={15} /> แก้ไข</button>
      </div>
    </header>
  );
}

export function VariantA() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-800">
      <TopBar title={`ออเดอร์ #${order.no}`} />
      <main className="mx-auto max-w-7xl p-5 lg:p-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{order.status}</span><h2 className="mt-3 text-2xl font-semibold">{order.customer}</h2><p className="mt-1 text-sm text-stone-400">นัดจัดส่ง {order.date} · {order.time}</p></div>
            <div className="text-right"><p className="text-xs text-stone-400">ยอดรวมสุทธิ</p><b className="text-3xl">฿{(order.bouquet + order.delivery).toLocaleString()}</b></div>
          </div>
          <StatusSteps />
        </section>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="space-y-5">
            <section className="grid gap-5 rounded-3xl border border-stone-200 bg-white p-5 sm:grid-cols-[220px_1fr]">
              <BouquetPlaceholder />
              <div><div className="flex items-center gap-2 text-[#d34f77]"><Flower2 size={17} /><h3 className="font-semibold text-stone-800">รายละเอียดช่อดอกไม้</h3></div><div className="mt-4 space-y-3">{order.flowers.map((flower) => <div key={flower} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm"><span>{flower}</span><Check size={14} className="text-emerald-600" /></div>)}</div><p className="mt-4 text-sm text-stone-500">กระดาษ {order.paper} · โบว์ {order.bow}</p><div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><MessageSquareText size={14} className="mr-2 inline" />{order.card}</div></div>
            </section>
          </div>
          <aside className="space-y-4">
            <section className="rounded-3xl border border-stone-200 bg-white p-5"><h3 className="font-semibold">ลูกค้าและผู้รับ</h3><div className="mt-4 space-y-3 text-sm"><p className="flex gap-2"><UserRound size={15} className="text-[#d34f77]" /> {order.customer}</p><p className="flex gap-2"><Phone size={15} className="text-[#d34f77]" /> {order.phone}</p><div className="border-t border-stone-100 pt-3"><b>{order.recipient}</b><p className="text-stone-400">{order.recipientPhone}</p></div></div></section>
            <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5"><h3 className="flex items-center gap-2 font-semibold"><Truck size={16} className="text-amber-700" /> การจัดส่ง</h3><p className="mt-3 text-sm">{order.address}</p><a href={order.map} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#c34f72]"><MapPin size={14} /> เปิดแผนที่ <ExternalLink size={12} /></a></section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export function VariantB() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-800">
      <TopBar title="Bouquet story" />
      <main className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[minmax(360px,.9fr)_1.1fr] lg:p-8">
        <div className="lg:sticky lg:top-8 lg:self-start"><BouquetPlaceholder tall /><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4"><p className="text-xs text-stone-400">ค่าช่อ</p><b className="mt-1 block text-xl">฿{order.bouquet.toLocaleString()}</b></div><div className="rounded-2xl bg-rose-50 p-4"><p className="text-xs text-[#a14361]">รวมสุทธิ</p><b className="mt-1 block text-xl">฿{(order.bouquet + order.delivery).toLocaleString()}</b></div></div></div>
        <div className="space-y-4">
          <section className="rounded-3xl border border-stone-200 bg-white p-6"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{order.status}</span><h2 className="mt-4 text-3xl font-semibold">ช่อสำหรับ {order.customer}</h2><p className="mt-2 text-stone-400">{order.date} · {order.time}</p><div className="mt-6"><StatusSteps /></div></section>
          <section className="rounded-3xl border border-stone-200 bg-white p-6"><h3 className="font-semibold">สูตรช่อ</h3><div className="mt-4 divide-y divide-stone-100">{order.flowers.map((flower) => <p key={flower} className="py-3 text-sm">{flower}</p>)}</div><div className="mt-3 flex gap-2"><span className="rounded-full bg-stone-100 px-3 py-1 text-xs">กระดาษ {order.paper}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs">โบว์ {order.bow}</span></div></section>
          <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-stone-200 bg-white p-5"><h3 className="font-semibold">ผู้สั่ง</h3><p className="mt-3">{order.customer}</p><p className="text-sm text-stone-400">{order.phone}</p></div><div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5"><h3 className="font-semibold">ผู้รับ</h3><p className="mt-3">{order.recipient}</p><p className="text-sm text-stone-400">{order.recipientPhone}</p></div></section>
        </div>
      </main>
    </div>
  );
}

export function VariantC() {
  return (
    <div className="min-h-screen bg-[#eef1e8] text-[#17211b]">
      <TopBar title="Order operations" />
      <main className="mx-auto max-w-7xl p-5 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_310px]">
          <aside className="rounded-[28px] bg-[#17211b] p-6 text-white"><p className="text-xs uppercase tracking-[.2em] text-white/40">Order #{order.no}</p><h2 className="mt-3 text-2xl font-semibold">{order.customer}</h2><p className="mt-1 text-sm text-white/50">{order.phone}</p><div className="mt-7"><StatusSteps vertical /></div></aside>
          <section className="space-y-5"><div className="rounded-[28px] bg-white p-6"><div className="flex items-center justify-between"><div><p className="text-xs text-stone-400">งานถัดไป</p><h2 className="mt-1 text-xl font-semibold">จัดช่อดอกไม้</h2></div><span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Flower2 /></span></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-stone-50 p-4"><CalendarDays size={15} /><p className="mt-2 text-sm">{order.date}</p></div><div className="rounded-2xl bg-stone-50 p-4"><Clock3 size={15} /><p className="mt-2 text-sm">{order.time}</p></div></div></div><div className="rounded-[28px] bg-white p-6"><h3 className="font-semibold">รายการจัดช่อ</h3>{order.flowers.map((flower) => <div key={flower} className="mt-3 flex items-center gap-3 rounded-2xl border border-stone-100 p-4"><span className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#d34f77]"><Check size={14} /></span><span className="text-sm">{flower}</span></div>)}</div></section>
          <aside className="space-y-4"><section className="rounded-[28px] bg-[#f3c95f] p-6"><PackageCheck size={22} /><p className="mt-5 text-sm">ยอดรวมออเดอร์</p><b className="text-3xl">฿{(order.bouquet + order.delivery).toLocaleString()}</b></section><section className="rounded-[28px] bg-white p-5"><h3 className="flex items-center gap-2 font-semibold"><Truck size={16} /> จุดจัดส่ง</h3><p className="mt-3 text-sm">{order.address}</p><p className="mt-1 text-xs text-stone-400">{order.recipient} · {order.recipientPhone}</p><button className="mt-4 w-full rounded-xl bg-[#17211b] py-3 text-sm font-semibold text-white">เปิดเส้นทาง</button></section></aside>
        </div>
      </main>
    </div>
  );
}

function PrototypeSwitcher({ current, onChange }: { current: VariantKey; onChange: (variant: VariantKey) => void }) {
  const index = variants.findIndex((variant) => variant.key === current);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") onChange(variants[(index - 1 + variants.length) % variants.length].key);
      if (event.key === "ArrowRight") onChange(variants[(index + 1) % variants.length].key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, onChange]);
  if (process.env.NODE_ENV === "production") return null;
  return <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-stone-950 px-3 py-2 text-sm text-white shadow-2xl"><button aria-label="Previous variant" onClick={() => onChange(variants[(index - 1 + variants.length) % variants.length].key)} className="grid size-8 place-items-center rounded-full hover:bg-white/10"><ChevronLeft size={17} /></button><span className="min-w-40 text-center"><b>{current}</b> — {variants[index].name}</span><button aria-label="Next variant" onClick={() => onChange(variants[(index + 1) % variants.length].key)} className="grid size-8 place-items-center rounded-full hover:bg-white/10"><ChevronRight size={17} /></button></div>;
}

export default function OrderDetailPrototypePage() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("variant")?.toUpperCase();
  const current: VariantKey = raw === "B" || raw === "C" ? raw : "A";
  const setVariant = (variant: VariantKey) => {
    const next = new URLSearchParams(params.toString());
    next.set("variant", variant);
    router.replace(`/prototype/order-detail?${next}`);
  };
  return <>{current === "A" && <VariantA />}{current === "B" && <VariantB />}{current === "C" && <VariantC />}<PrototypeSwitcher current={current} onChange={setVariant} /></>;
}
