"use client";

import { Check, ExternalLink, Flower2, MapPin, MessageSquareText, Phone, Truck, UserRound } from "lucide-react";
import type { OrderRecord } from "@/components/orderlist/types";
import { getDeliveryInfo } from "@/components/orderlist/types";
import { computeOrderTotal } from "@/components/formorder/types";
import type { FlowerFormData } from "@/components/formorder/types";

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("th-TH") : String(value);
};

export const CustomerReadCard = ({ order }: { order: OrderRecord }) => {
  const delivery = getDeliveryInfo(order.delivery_info);
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
      <h3 className="font-semibold text-stone-800 dark:text-stone-100">ลูกค้าและผู้รับ</h3>
      <div className="mt-4 space-y-3 text-sm dark:text-stone-200">
        <p className="flex items-center gap-2"><UserRound size={15} className="text-[#d34f77]" /> {order.customer?.line_name || "-"}</p>
        <p className="flex items-center gap-2"><Phone size={15} className="text-[#d34f77]" /> {order.customer?.phone || "-"}</p>
        {delivery && (
          <div className="border-t border-stone-100 pt-3 dark:border-white/10">
            <b>{delivery.recipient_name || "-"}</b>
            <p className="text-stone-400">{delivery.recipient_phone || "-"}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export const BouquetReadCard = ({ order }: { order: OrderRecord }) => {
  const items = order.items ?? [];
  const finishedPhoto = order.attachments?.find((a) => a.label === "รูปช่อที่จัดเสร็จแล้ว");
  const referencePhoto = order.attachments?.find((a) => a.label === "รูปตัวอย่าง");
  const finishedPhotoUrl = finishedPhoto?.full_url ?? finishedPhoto?.src;
  const referencePhotoUrl = referencePhoto?.full_url ?? referencePhoto?.src;

  return (
    <section className="grid gap-5 rounded-3xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c] sm:grid-cols-[220px_1fr]">
      <div className="relative grid min-h-56 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 dark:from-rose-400/10 dark:via-white/5 dark:to-amber-400/10">
        {referencePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={referencePhotoUrl} alt="รูปตัวอย่าง" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="text-center"><p className="text-7xl">💐</p><span className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs text-stone-500 dark:bg-white/10 dark:text-stone-300">รูปตัวอย่างลูกค้า</span></div>
        )}
      </div>
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-100"><Flower2 size={17} className="text-[#d34f77]" /> รายละเอียดช่อดอกไม้</h3>
        <div className="mt-4 space-y-3 text-sm dark:text-stone-200">
          {items.length > 0 ? items.map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-white/5">
              <span>{item.flowerType || "-"} · {item.flowerColor || "-"}</span>
              <span className="flex items-center gap-2"><b>{item.quantity ?? "-"} ดอก</b><Check size={14} className="text-emerald-600" /></span>
            </div>
          )) : <p className="text-stone-500">ไม่มีรายการ</p>}
        </div>
        <p className="mt-4 text-sm text-stone-500">กระดาษ {order.paper_color || "-"} · โบว์ {order.bow_color || "-"}</p>
        {order.has_card && order.card_message && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200"><MessageSquareText size={14} className="mr-2 inline" />{order.card_message}</div>}
        {finishedPhotoUrl && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-stone-400">รูปช่อที่จัดเสร็จแล้ว</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={finishedPhotoUrl} alt="รูปช่อที่จัดเสร็จแล้ว" className="h-28 w-full rounded-xl object-cover" />
          </div>
        )}
      </div>
    </section>
  );
};

export const FulfilmentReadCard = ({ order }: { order: OrderRecord }) => {
  const delivery = getDeliveryInfo(order.delivery_info);

  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-300/20 dark:bg-amber-400/10">
      <h3 className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-100"><Truck size={16} className="text-amber-700" /> การจัดส่ง</h3>
      {order.pickup_mode === "delivery" && delivery && (
        <div className="text-sm dark:text-stone-200">
          <p className="mt-3">{delivery.address || "-"}</p>
          {delivery.map_link && (
            <a href={delivery.map_link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#c34f72] dark:text-rose-300">
              <MapPin size={14} /> เปิดแผนที่ <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
      {order.pickup_mode !== "delivery" && <p className="mt-3 text-sm dark:text-stone-200">รับที่ร้าน Sweet Pea & Co.</p>}
    </section>
  );
};

export const PaymentSummaryCard = ({ order }: { order: OrderRecord }) => {
  const delivery = getDeliveryInfo(order.delivery_info);
  const flowerLike: Pick<FlowerFormData, "bouquetPrice" | "pickupMode" | "delivery"> = {
    bouquetPrice: String(order.bouquet_price ?? 0),
    pickupMode: order.pickup_mode ?? "workin",
    delivery: {
      recipientName: "",
      recipientPhone: "",
      address: "",
      mapLink: "",
      deliveryPrice: String(delivery?.delivery_price ?? 0),
    },
  };
  const { bouquet, deliveryFee, total } = computeOrderTotal(flowerLike);

  return (
    <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
      <h3 className="mb-3 text-sm font-semibold text-stone-800">ยอดชำระ</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">ราคาช่อ</span>
          <span>{formatMoney(bouquet)} บาท</span>
        </div>
        {order.pickup_mode === "delivery" && (
          <div className="flex justify-between">
            <span className="text-stone-500">ค่าจัดส่ง</span>
            <span>{formatMoney(deliveryFee)} บาท</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 text-base font-semibold">
          <span>ยอดรวมสุทธิ</span>
          <span>{formatMoney(total)} บาท</span>
        </div>
      </div>
    </section>
  );
};
