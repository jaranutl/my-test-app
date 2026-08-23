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
