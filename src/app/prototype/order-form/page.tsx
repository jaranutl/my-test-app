"use client";

// Three order-form prototypes, switchable via ?variant=, on /prototype/order-form.
// Critique — broken: stub save/upload; matters: completion errors remain unmeasured; bulletproof: winner rebuilt with validation, Supabase, upload, save + print QA.
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CirclePlus,
  FileText,
  Gift,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Package,
  Printer,
  Save,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";

type VariantKey = "A" | "B" | "C";
type Draft = {
  customer: string;
  phone: string;
  flower: string;
  color: string;
  quantity: string;
  paper: string;
  bow: string;
  price: string;
  date: string;
  time: string;
  pickup: "store" | "delivery";
  card: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  mapLink: string;
  deliveryFee: string;
};
type FlowerDraft = {
  id: number;
  type: string;
  color: string;
  quantity: string;
};

const variants: { key: VariantKey; name: string }[] = [
  { key: "A", name: "Split workspace" },
  { key: "B", name: "Guided steps" },
  { key: "C", name: "Order canvas" },
];
const initialDraft: Draft = {
  customer: "",
  phone: "",
  flower: "กุหลาบ",
  color: "ชมพู",
  quantity: "12",
  paper: "ครีม",
  bow: "ชมพู",
  price: "1290",
  date: "2026-08-24",
  time: "14:30",
  pickup: "store",
  card: "",
  recipientName: "",
  recipientPhone: "",
  address: "",
  mapLink: "",
  deliveryFee: "0",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#faf9f7] text-stone-800">
      <aside className="hidden w-14 shrink-0 flex-col items-center border-r border-stone-200 bg-white md:flex">
        <div className="grid h-16 place-items-center">
          <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-rose-100">
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
              className={`grid size-10 place-items-center rounded-xl ${i === 2 ? "bg-rose-50 text-[#d34f77]" : "text-stone-400"}`}
            >
              <Icon size={19} />
            </span>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-17 grid-cols-3 border-t border-stone-200 bg-white md:hidden">
        {[
          [LayoutDashboard, "ภาพรวม"],
          [ShoppingBag, "รายการ"],
          [CirclePlus, "เพิ่มใหม่"],
        ].map(([Icon, label], i) => {
          const NavIcon = Icon as typeof LayoutDashboard;
          return (
            <span
              key={label as string}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] ${i === 2 ? "text-[#d34f77]" : "text-stone-400"}`}
            >
              <NavIcon size={20} />
              {label as string}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
      />
    </label>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-[#df6688]"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Pickup({
  draft,
  set,
}: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        ["store", Store, "รับที่ร้าน", "ไม่มีค่าส่ง"],
        ["delivery", Truck, "ให้จัดส่ง", "เพิ่มที่อยู่ภายหลัง"],
      ].map(([value, Icon, title, note]) => {
        const ModeIcon = Icon as typeof Store;
        const active = draft.pickup === value;
        return (
          <button
            key={value as string}
            onClick={() => set({ pickup: value as Draft["pickup"] })}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left ${active ? "border-[#df6688] bg-rose-50" : "border-stone-200 bg-white"}`}
          >
            <span
              className={`grid size-9 place-items-center rounded-lg ${active ? "bg-[#df6688] text-white" : "bg-stone-100 text-stone-500"}`}
            >
              <ModeIcon size={17} />
            </span>
            <span>
              <b className="block text-sm">{title as string}</b>
              <small className="text-[10px] text-stone-400">
                {note as string}
              </small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DraftSummary({
  draft,
  dark = false,
}: {
  draft: Draft;
  dark?: boolean;
}) {
  const bouquetTotal = Number(draft.price || 0);
  const deliveryTotal =
    draft.pickup === "delivery" ? Number(draft.deliveryFee || 0) : 0;
  const grandTotal = bouquetTotal + deliveryTotal;
  return (
    <div
      className={`rounded-2xl p-5 ${dark ? "bg-[#18201b] text-white" : "border border-stone-200 bg-white"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">สรุปออเดอร์</h3>
        <span
          className={`text-xs ${dark ? "text-white/40" : "text-stone-400"}`}
        >
          Draft · ยังไม่บันทึก
        </span>
      </div>
      <div
        className={`mt-4 space-y-3 border-y py-4 text-sm ${dark ? "border-white/10" : "border-stone-100"}`}
      >
        <SummaryRow label="ลูกค้า" value={draft.customer || "ยังไม่ระบุ"} />
        <SummaryRow
          label="ช่อดอกไม้"
          value={`${draft.flower} ${draft.color} × ${draft.quantity}`}
        />
        <SummaryRow label="รับช่อ" value={`${draft.date} · ${draft.time}`} />
        <SummaryRow
          label="รูปแบบ"
          value={draft.pickup === "store" ? "รับที่ร้าน" : "จัดส่ง"}
        />
        {draft.card && <SummaryRow label="ข้อความการ์ด" value={draft.card} />}
        <div
          className={`border-t pt-3 ${dark ? "border-white/10" : "border-stone-100"}`}
        >
          <SummaryRow
            label="ราคาช่อ"
            value={`฿${bouquetTotal.toLocaleString("th-TH")}`}
          />
          {draft.pickup === "delivery" && (
            <div className="mt-2">
              <SummaryRow
                label="ค่าจัดส่ง"
                value={`฿${deliveryTotal.toLocaleString("th-TH")}`}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className={dark ? "text-white/50" : "text-stone-500"}>
          ยอดรวมสุทธิ
        </span>
        <strong className="text-2xl">
          ฿{grandTotal.toLocaleString("th-TH")}
        </strong>
      </div>
    </div>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="opacity-50">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function UploadBox({ actual = false }: { actual?: boolean }) {
  return (
    <button className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 transition hover:border-rose-300 hover:bg-rose-50">
      <ImagePlus size={21} />
      <span className="mt-2 text-xs font-medium">
        {actual ? "เพิ่มรูปช่อที่จัดเสร็จ" : "เพิ่มรูปตัวอย่าง"}
      </span>
      <span className="mt-1 text-[10px]">PNG, JPG · สูงสุด 10 MB</span>
    </button>
  );
}

function PrintableOrder({
  draft,
  flowers,
}: {
  draft: Draft;
  flowers: FlowerDraft[];
}) {
  const bouquet = Number(draft.price || 0);
  const delivery =
    draft.pickup === "delivery" ? Number(draft.deliveryFee || 0) : 0;
  return (
    <article className="prototype-order-print-sheet">
      <header>
        <div>
          <p>Sweet Pea & Co. Flower Studio</p>
          <h1>ใบคำสั่งซื้อ #1059</h1>
        </div>
        <div>
          <b>วันที่รับช่อ</b>
          <p>
            {draft.date} · {draft.time} น.
          </p>
        </div>
      </header>
      <section>
        <h2>ข้อมูลลูกค้า</h2>
        <div className="print-grid">
          <p>
            <span>ชื่อ LINE</span>
            <b>{draft.customer || "-"}</b>
          </p>
          <p>
            <span>เบอร์โทร</span>
            <b>{draft.phone || "-"}</b>
          </p>
        </div>
      </section>
      <section>
        <h2>รายละเอียดช่อดอกไม้</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ชนิดดอกไม้</th>
              <th>สี</th>
              <th>จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {flowers.map((flower, index) => (
              <tr key={flower.id}>
                <td>{index + 1}</td>
                <td>{flower.type || "-"}</td>
                <td>{flower.color || "-"}</td>
                <td>{flower.quantity} ดอก</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="print-grid">
          <p>
            <span>สีกระดาษห่อ</span>
            <b>{draft.paper}</b>
          </p>
          <p>
            <span>สีโบว์</span>
            <b>{draft.bow}</b>
          </p>
        </div>
        {draft.card && (
          <div className="print-note">
            <span>ข้อความการ์ด</span>
            <p>{draft.card}</p>
          </div>
        )}
      </section>
      <section>
        <h2>
          {draft.pickup === "delivery"
            ? "รายละเอียดการจัดส่ง"
            : "รายละเอียดการรับสินค้า"}
        </h2>
        {draft.pickup === "delivery" ? (
          <>
            <div className="print-grid">
              <p>
                <span>ชื่อผู้รับ</span>
                <b>{draft.recipientName || "-"}</b>
              </p>
              <p>
                <span>เบอร์โทรผู้รับ</span>
                <b>{draft.recipientPhone || "-"}</b>
              </p>
            </div>
            <p>
              <span>ที่อยู่</span>
              <b>{draft.address || "-"}</b>
            </p>
            {draft.mapLink && (
              <p>
                <span>ลิงก์แผนที่</span>
                <b>{draft.mapLink}</b>
              </p>
            )}
          </>
        ) : (
          <p>
            <span>รูปแบบ</span>
            <b>
              รับช่อที่ร้าน · {draft.date} {draft.time} น.
            </b>
          </p>
        )}
      </section>
      <footer>
        <div>
          <p>
            <span>ราคาช่อ</span>
            <b>฿{bouquet.toLocaleString("th-TH")}</b>
          </p>
          {draft.pickup === "delivery" && (
            <p>
              <span>ค่าจัดส่ง</span>
              <b>฿{delivery.toLocaleString("th-TH")}</b>
            </p>
          )}
          <p className="print-total">
            <span>ยอดรวมสุทธิ</span>
            <b>฿{(bouquet + delivery).toLocaleString("th-TH")}</b>
          </p>
        </div>
      </footer>
    </article>
  );
}

export function VariantA({
  draft,
  set,
}: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
}) {
  return (
    <Shell>
      <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-5 lg:px-8">
        <div>
          <p className="text-xs text-stone-400">คำสั่งซื้อ / สร้างใหม่</p>
          <h1 className="font-semibold">สร้างคำสั่งซื้อใหม่</h1>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
          เลขที่สร้างอัตโนมัติ
        </span>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 p-5 lg:grid-cols-[1fr_340px] lg:p-8">
        <div className="space-y-5">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <SectionTitle
              icon={<UserRound />}
              number="01"
              title="ข้อมูลลูกค้า"
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="ชื่อ LINE ลูกค้า"
                value={draft.customer}
                onChange={(v) => set({ customer: v })}
                placeholder="เช่น mintty"
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={draft.phone}
                onChange={(v) => set({ phone: v })}
                placeholder="xxx-xxx-xxxx"
              />
            </div>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <SectionTitle icon={<Gift />} number="02" title="รายละเอียดช่อ" />
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <SelectBox
                label="ชนิดดอกไม้"
                value={draft.flower}
                options={["กุหลาบ", "ลิลลี่", "ทิวลิป"]}
                onChange={(v) => set({ flower: v })}
              />
              <SelectBox
                label="สี"
                value={draft.color}
                options={["ชมพู", "ขาว", "แดง", "ม่วง"]}
                onChange={(v) => set({ color: v })}
              />
              <Input
                label="จำนวน"
                type="number"
                value={draft.quantity}
                onChange={(v) => set({ quantity: v })}
              />
              <Input
                label="ราคาช่อ"
                type="number"
                value={draft.price}
                onChange={(v) => set({ price: v })}
              />
            </div>
            <button className="mt-4 text-xs font-semibold text-[#d34f77]">
              + เพิ่มชนิดดอกไม้
            </button>
            <div className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
              <SelectBox
                label="สีกระดาษห่อ"
                value={draft.paper}
                options={["ครีม", "ขาว", "ชมพู", "ดำ"]}
                onChange={(v) => set({ paper: v })}
              />
              <SelectBox
                label="สีโบว์"
                value={draft.bow}
                options={["ชมพู", "ขาว", "ทอง", "แดง"]}
                onChange={(v) => set({ bow: v })}
              />
            </div>
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <SectionTitle
              icon={<CalendarDays />}
              number="03"
              title="นัดรับและจัดส่ง"
            />
            <div className="mt-4">
              <Pickup draft={draft} set={set} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="วันที่รับช่อ"
                type="date"
                value={draft.date}
                onChange={(v) => set({ date: v })}
              />
              <Input
                label="เวลาที่รับช่อ"
                type="time"
                value={draft.time}
                onChange={(v) => set({ time: v })}
              />
            </div>
          </section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <DraftSummary draft={draft} />
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold">รูปภาพ</p>
            <div className="grid grid-cols-2 gap-2">
              <UploadBox />
              <UploadBox actual />
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#dd5f83] py-3 text-sm font-semibold text-white">
            <Save size={17} /> บันทึกออเดอร์
          </button>
        </aside>
      </div>
    </Shell>
  );
}

function SectionTitle({
  icon,
  number,
  title,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 text-stone-800">
      <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-[#d34f77] [&>svg]:size-17">
        {icon}
      </span>
      <div>
        <span className="text-[10px] font-bold tracking-wider text-stone-300">
          STEP {number}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
    </div>
  );
}

export function VariantB({
  draft,
  set,
}: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
}) {
  const [step, setStep] = useState(1);
  const [flowerRows, setFlowerRows] = useState<FlowerDraft[]>([
    { id: 1, type: draft.flower, color: draft.color, quantity: draft.quantity },
  ]);
  const [hasCard, setHasCard] = useState(Boolean(draft.card));
  const [saved, setSaved] = useState(false);
  const titles = ["ลูกค้า", "ช่อดอกไม้", "การรับสินค้า", "ตรวจสอบ"];
  const printOrder = () => {
    document.body.classList.add("prototype-printing");
    window.print();
    document.body.classList.remove("prototype-printing");
  };
  const updateFlower = (id: number, patch: Partial<FlowerDraft>) =>
    setFlowerRows((rows) =>
      rows.map((row, index) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (index === 0)
          set({
            flower: next.type,
            color: next.color,
            quantity: next.quantity,
          });
        return next;
      }),
    );
  const canAddFlower =
    flowerRows.length < 4 &&
    flowerRows.every(
      (row) => row.type && row.color && Number(row.quantity) > 0,
    );
  return (
    <Shell>
      <div className="mx-auto max-w-4xl p-5 lg:py-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#d34f77]">
            New order
          </span>
          <h1 className="mt-2 text-3xl font-semibold">สร้างคำสั่งซื้อใหม่</h1>
          <p className="mt-1 text-sm text-stone-400">
            ทีละขั้น ใช้เวลาประมาณ 2 นาที
          </p>
        </div>
        <div className="mb-6 grid grid-cols-4">
          {titles.map((title, i) => {
            const n = i + 1;
            return (
              <button
                key={title}
                onClick={() => setStep(n)}
                className="relative flex flex-col items-center gap-2 text-xs"
              >
                <span
                  className={`z-10 grid size-8 place-items-center rounded-full border-2 ${n < step ? "border-[#dd5f83] bg-[#dd5f83] text-white" : n === step ? "border-[#dd5f83] bg-white text-[#dd5f83]" : "border-stone-200 bg-[#faf9f7] text-stone-300"}`}
                >
                  {n < step ? <Check size={15} /> : n}
                </span>
                <span
                  className={
                    n === step
                      ? "font-semibold text-stone-800"
                      : "text-stone-400"
                  }
                >
                  {title}
                </span>
                {i < 3 && (
                  <span
                    className={`absolute left-1/2 top-4 h-0.5 w-full ${n < step ? "bg-[#dd5f83]" : "bg-stone-200"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <section className="min-h-96 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          {step === 1 && (
            <div>
              <WizardHeading
                icon={<UserRound />}
                title="ลูกค้าคนนี้คือใคร?"
                note="ใช้สำหรับติดต่อและค้นหาออเดอร์ภายหลัง"
              />
              <div className="mx-auto mt-8 max-w-lg space-y-4">
                <Input
                  label="ชื่อ LINE ลูกค้า"
                  value={draft.customer}
                  onChange={(v) => set({ customer: v })}
                  placeholder="เช่น mintty"
                />
                <Input
                  label="เบอร์โทรศัพท์"
                  value={draft.phone}
                  onChange={(v) => set({ phone: v })}
                  placeholder="xxx-xxx-xxxx"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <WizardHeading
                icon={<Gift />}
                title="จัดช่อแบบไหนดี?"
                note="เพิ่มดอกไม้ได้สูงสุด 4 ชนิด"
              />
              <div className="mx-auto mt-8 max-w-2xl space-y-3">
                {flowerRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <b className="text-xs text-stone-500">
                        ดอกไม้ชนิดที่ {index + 1}
                      </b>
                      <button
                        disabled={flowerRows.length === 1}
                        onClick={() =>
                          setFlowerRows((rows) =>
                            rows.filter((item) => item.id !== row.id),
                          )
                        }
                        className="grid size-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-400 disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_90px]">
                      <SelectBox
                        label="ชนิดดอกไม้"
                        value={row.type}
                        options={[
                          "กุหลาบ",
                          "ลิลลี่",
                          "ทิวลิป",
                          "ทานตะวัน",
                          "ไฮเดรนเยีย",
                        ]}
                        onChange={(v) => updateFlower(row.id, { type: v })}
                      />
                      <SelectBox
                        label="สีดอกไม้"
                        value={row.color}
                        options={["ชมพู", "ขาว", "แดง", "ม่วง", "เหลือง"]}
                        onChange={(v) => updateFlower(row.id, { color: v })}
                      />
                      <Input
                        label="จำนวน"
                        type="number"
                        value={row.quantity}
                        onChange={(v) => updateFlower(row.id, { quantity: v })}
                      />
                    </div>
                  </div>
                ))}
                <button
                  disabled={!canAddFlower}
                  onClick={() =>
                    setFlowerRows((rows) => [
                      ...rows,
                      {
                        id: Math.max(...rows.map((row) => row.id)) + 1,
                        type: "",
                        color: "",
                        quantity: "1",
                      },
                    ])
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#df6688] bg-rose-50 py-3 text-sm font-semibold text-[#d34f77] disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-300"
                >
                  <CirclePlus size={16} /> เพิ่มชนิดดอกไม้ ({flowerRows.length}
                  /4)
                </button>
                <div className="grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-3">
                  <Input
                    label="ราคาช่อ"
                    type="number"
                    value={draft.price}
                    onChange={(v) => set({ price: v })}
                  />
                  <SelectBox
                    label="สีกระดาษห่อ"
                    value={draft.paper}
                    options={["ครีม", "ขาว", "ชมพู", "ดำ"]}
                    onChange={(v) => set({ paper: v })}
                  />
                  <SelectBox
                    label="สีโบว์"
                    value={draft.bow}
                    options={["ชมพู", "ขาว", "ทอง", "แดง"]}
                    onChange={(v) => set({ bow: v })}
                  />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-stone-200 bg-white p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <b className="block text-sm">เขียนการ์ดอวยพร</b>
                  <span className="text-xs text-stone-400">
                    ไม่บังคับ · ลูกค้ากรอกข้อความที่ต้องการ
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasCard}
                  onChange={(e) => {
                    setHasCard(e.target.checked);
                    if (!e.target.checked) set({ card: "" });
                  }}
                  className="toggle toggle-sm border-stone-300 bg-stone-200 checked:border-[#df6688] checked:bg-[#df6688]"
                />
              </label>
              {hasCard && (
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-stone-500">
                      ข้อความในการ์ด
                    </span>
                    <textarea
                      value={draft.card}
                      onChange={(e) => set({ card: e.target.value })}
                      rows={4}
                      maxLength={300}
                      placeholder="เช่น สุขสันต์วันเกิด ขอให้มีความสุขมากๆ"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
                    />
                  </label>
                  <div className="mt-1 flex justify-between text-[10px] text-stone-400">
                    <span>ข้อความนี้จะปรากฏในหน้าตรวจสอบและใบออเดอร์</span>
                    <span>{draft.card.length}/300</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <WizardHeading
                icon={<Truck />}
                title="ลูกค้าจะรับช่ออย่างไร?"
                note="กำหนดรูปแบบ วัน และเวลานัดรับ"
              />
              <div className="mx-auto mt-8 max-w-2xl space-y-4">
                <Pickup draft={draft} set={set} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="วันที่รับช่อ"
                    type="date"
                    value={draft.date}
                    onChange={(v) => set({ date: v })}
                  />
                  <Input
                    label="เวลาที่รับช่อ"
                    type="time"
                    value={draft.time}
                    onChange={(v) => set({ time: v })}
                  />
                </div>
                {draft.pickup === "delivery" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                        <Truck size={16} />
                      </span>
                      <div>
                        <b className="block text-sm">รายละเอียดการจัดส่ง</b>
                        <span className="text-xs text-stone-400">
                          ข้อมูลผู้รับ ที่อยู่ และค่าจัดส่ง
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="ชื่อผู้รับ"
                        value={draft.recipientName}
                        onChange={(v) => set({ recipientName: v })}
                        placeholder="ชื่อผู้รับสินค้า"
                      />
                      <Input
                        label="เบอร์โทรผู้รับ"
                        value={draft.recipientPhone}
                        onChange={(v) => set({ recipientPhone: v })}
                        placeholder="xxx-xxx-xxxx"
                      />
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-xs font-medium text-stone-500">
                          ที่อยู่จัดส่ง
                        </span>
                        <textarea
                          value={draft.address}
                          onChange={(e) => set({ address: e.target.value })}
                          rows={3}
                          placeholder="ที่อยู่ละเอียด + จุดสังเกต"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
                        />
                      </label>
                      <Input
                        label="ลิงก์แผนที่"
                        value={draft.mapLink}
                        onChange={(v) => set({ mapLink: v })}
                        placeholder="https://maps.google.com/..."
                      />
                      <Input
                        label="ค่าจัดส่ง (บาท)"
                        type="number"
                        value={draft.deliveryFee}
                        onChange={(v) => set({ deliveryFee: v })}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                      <span className="text-sm text-stone-500">
                        ยอดรวมอัตโนมัติ
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">
                          ฿{Number(draft.price || 0).toLocaleString("th-TH")} +
                          ฿
                          {Number(draft.deliveryFee || 0).toLocaleString(
                            "th-TH",
                          )}
                        </p>
                        <b className="text-xl text-[#d34f77]">
                          ฿
                          {(
                            Number(draft.price || 0) +
                            Number(draft.deliveryFee || 0)
                          ).toLocaleString("th-TH")}
                        </b>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <WizardHeading
                icon={<FileText />}
                title="ตรวจสอบก่อนบันทึก"
                note="เช็กข้อมูลให้ครบ แล้วบันทึกและพิมพ์ใบออเดอร์"
              />
              <div className="mx-auto mt-7 max-w-lg">
                <DraftSummary draft={draft} />
                <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold text-stone-500">
                    ดอกไม้ {flowerRows.length} ชนิด
                  </p>
                  {flowerRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="flex justify-between border-t border-stone-100 py-2 text-sm first:border-0"
                    >
                      <span>
                        {index + 1}. {row.type} · {row.color}
                      </span>
                      <b>{row.quantity} ดอก</b>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <UploadBox />
                  <UploadBox actual />
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="mt-5 flex justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm disabled:opacity-30"
          >
            <ArrowLeft size={16} /> ย้อนกลับ
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              ถัดไป <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setSaved(true)}
              className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Save size={16} /> บันทึกออเดอร์
            </button>
          )}
        </div>
        <PrintableOrder draft={draft} flowers={flowerRows} />
        {saved && (
          <div className="fixed inset-0 z-60 grid place-items-center bg-black/45 px-4">
            <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-2xl">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={20} />
              </span>
              <h2 className="mt-4 text-xl font-semibold">
                บันทึกออเดอร์สำเร็จ
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                ออเดอร์ <b className="text-stone-800">#1059</b> ถูกบันทึกแล้ว
              </p>
              <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                กรุณาพิมพ์ใบออเดอร์เพื่อแนบกับรายการนี้
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={printOrder}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-3 text-sm font-semibold text-white"
                >
                  <Printer size={16} /> พิมพ์ใบออเดอร์
                </button>
                <button
                  onClick={() => setSaved(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
function WizardHeading({
  icon,
  title,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#d34f77] [&>svg]:size-21">
        {icon}
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-stone-400">{note}</p>
    </div>
  );
}

export function VariantC({
  draft,
  set,
}: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
}) {
  return (
    <Shell>
      <header className="flex items-center justify-between bg-[#18201b] px-5 py-4 text-white lg:px-8">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-white/40">
            Sweet Pea & Co. studio
          </p>
          <h1 className="text-lg font-semibold">Order canvas</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-white/15 px-3 py-2 text-xs">
            บันทึกร่าง
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#f3c95f] px-4 py-2 text-xs font-semibold text-[#18201b]">
            <Save size={14} /> บันทึกออเดอร์
          </button>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[1fr_370px]">
        <div className="p-5 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-400">ออเดอร์ใหม่</p>
              <h2 className="text-2xl font-semibold">
                จัดรายละเอียดบนพื้นที่เดียว
              </h2>
            </div>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-400">
              Auto-saved 10:42
            </span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <CanvasCard icon={<UserRound />} title="ลูกค้า">
              <div className="space-y-3">
                <Input
                  label="ชื่อ LINE"
                  value={draft.customer}
                  onChange={(v) => set({ customer: v })}
                  placeholder="ชื่อลูกค้า"
                />
                <Input
                  label="เบอร์โทร"
                  value={draft.phone}
                  onChange={(v) => set({ phone: v })}
                  placeholder="xxx-xxx-xxxx"
                />
              </div>
            </CanvasCard>
            <CanvasCard icon={<CalendarDays />} title="วันรับสินค้า">
              <div className="space-y-3">
                <Pickup draft={draft} set={set} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="วันที่"
                    type="date"
                    value={draft.date}
                    onChange={(v) => set({ date: v })}
                  />
                  <Input
                    label="เวลา"
                    type="time"
                    value={draft.time}
                    onChange={(v) => set({ time: v })}
                  />
                </div>
              </div>
            </CanvasCard>
            <CanvasCard icon={<Gift />} title="สูตรช่อ">
              <div className="grid grid-cols-2 gap-3">
                <SelectBox
                  label="ดอกไม้"
                  value={draft.flower}
                  options={["กุหลาบ", "ลิลลี่", "ทิวลิป"]}
                  onChange={(v) => set({ flower: v })}
                />
                <SelectBox
                  label="สี"
                  value={draft.color}
                  options={["ชมพู", "ขาว", "แดง", "ม่วง"]}
                  onChange={(v) => set({ color: v })}
                />
                <Input
                  label="จำนวน"
                  type="number"
                  value={draft.quantity}
                  onChange={(v) => set({ quantity: v })}
                />
                <Input
                  label="ราคา"
                  type="number"
                  value={draft.price}
                  onChange={(v) => set({ price: v })}
                />
                <SelectBox
                  label="กระดาษ"
                  value={draft.paper}
                  options={["ครีม", "ขาว", "ชมพู", "ดำ"]}
                  onChange={(v) => set({ paper: v })}
                />
                <SelectBox
                  label="โบว์"
                  value={draft.bow}
                  options={["ชมพู", "ขาว", "ทอง", "แดง"]}
                  onChange={(v) => set({ bow: v })}
                />
              </div>
            </CanvasCard>
            <CanvasCard icon={<Camera />} title="รูปภาพ">
              <div className="grid grid-cols-2 gap-3">
                <UploadBox />
                <UploadBox actual />
              </div>
            </CanvasCard>
          </div>
        </div>
        <aside className="border-l border-white/10 bg-[#243029] p-5 text-white lg:p-7">
          <div className="sticky top-5">
            <DraftSummary draft={draft} dark />
            <div className="mt-4 rounded-2xl bg-white/7 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin size={16} className="text-[#f3c95f]" /> จุดรับสินค้า
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">
                Sweet Pea & Co. Flower Studio
                <br />
                24/8 ถนนสุขุมวิท กรุงเทพฯ
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-white/15 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-white/8 text-[#f3c95f]">
                <Package size={18} />
              </span>
              <div>
                <p className="text-sm font-medium">หลังบันทึกสำเร็จ</p>
                <p className="text-xs text-white/40">
                  พิมพ์ใบออเดอร์สำหรับแนบช่อ
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
function CanvasCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#d34f77] [&>svg]:size-18">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Switcher({
  current,
  onChange,
}: {
  current: VariantKey;
  onChange: (key: VariantKey) => void;
}) {
  const index = variants.findIndex((v) => v.key === current);
  const move = useCallback(
    (step: number) =>
      onChange(
        variants[(index + step + variants.length) % variants.length].key,
      ),
    [index, onChange],
  );
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) ||
        t.isContentEditable
      )
        return;
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [move]);
  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/90 p-1.5 text-white shadow-2xl md:bottom-5">
      <button
        onClick={() => move(-1)}
        aria-label="Previous variant"
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowLeft size={15} />
      </button>
      <span className="min-w-36 text-center text-xs">
        <b>{current}</b> — {variants[index].name}
      </span>
      <button
        onClick={() => move(1)}
        aria-label="Next variant"
        className="grid size-8 place-items-center rounded-full hover:bg-white/15"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function OrderFormPrototypeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("variant")?.toUpperCase();
  const current: VariantKey = raw === "B" || raw === "C" ? raw : "A";
  const [draft, setDraft] = useState(initialDraft);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const onChange = useCallback(
    (key: VariantKey) => {
      const next = new URLSearchParams(params.toString());
      next.set("variant", key);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );
  return (
    <div className="compact-ui-icons fixed inset-0 z-50 overflow-auto bg-white">
      {current === "A" && <VariantA draft={draft} set={set} />}{" "}
      {current === "B" && <VariantB draft={draft} set={set} />}{" "}
      {current === "C" && <VariantC draft={draft} set={set} />}{" "}
      {process.env.NODE_ENV !== "production" && (
        <Switcher current={current} onChange={onChange} />
      )}
    </div>
  );
}

export default function OrderFormPrototype() {
  return (
    <Suspense>
      <OrderFormPrototypeContent />
    </Suspense>
  );
}
