"use client";

import type { FlowerFormData, FlowerRow } from "./types";
import { computeOrderTotal } from "./types";

export type OrderSummaryCardProps = {
  lineName: string;
  rows: FlowerRow[];
  flower: FlowerFormData;
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="opacity-50">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

export const OrderSummaryCard = ({ lineName, rows, flower }: OrderSummaryCardProps) => {
  const { bouquet, deliveryFee, total } = computeOrderTotal(flower);
  const flowerSummary = rows
    .filter((row) => row.type)
    .map((row) => `${row.type} ${row.color} × ${row.quantity}`)
    .join(", ");

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#202a23]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">สรุปออเดอร์</h3>
        <span className="text-xs text-stone-400">Draft · ยังไม่บันทึก</span>
      </div>
      <div className="mt-4 space-y-3 border-y border-stone-100 py-4 text-sm">
        <SummaryRow label="ลูกค้า" value={lineName || "ยังไม่ระบุ"} />
        <SummaryRow label="ช่อดอกไม้" value={flowerSummary || "ยังไม่ระบุ"} />
        <SummaryRow label="รับช่อ" value={`${flower.deliveryTime || "-"} น.`} />
        <SummaryRow label="รูปแบบ" value={flower.pickupMode === "workin" ? "รับที่ร้าน" : "จัดส่ง"} />
        {flower.hasCard && flower.cardMessage && (
          <SummaryRow label="ข้อความการ์ด" value={flower.cardMessage} />
        )}
        <div className="border-t border-stone-100 pt-3">
          <SummaryRow label="ราคาช่อ" value={`฿${bouquet.toLocaleString("th-TH")}`} />
          {flower.pickupMode === "delivery" && (
            <div className="mt-2">
              <SummaryRow label="ค่าจัดส่ง" value={`฿${deliveryFee.toLocaleString("th-TH")}`} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className="text-stone-500">ยอดรวมสุทธิ</span>
        <strong className="text-2xl">฿{total.toLocaleString("th-TH")}</strong>
      </div>
    </div>
  );
};
