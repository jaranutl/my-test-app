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
