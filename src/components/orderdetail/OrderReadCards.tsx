"use client";

import type { OrderRecord } from "@/components/orderlist/types";
import { getDeliveryInfo } from "@/components/orderlist/types";
import { computeOrderTotal } from "@/components/formorder/types";
import type { FlowerFormData } from "@/components/formorder/types";

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("th-TH") : String(value);
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value),
  );
};

export const CustomerReadCard = ({ order }: { order: OrderRecord }) => (
  <section className="rounded-2xl border border-stone-200 bg-white p-5">
    <h3 className="mb-3 text-sm font-semibold text-stone-800">ลูกค้า</h3>
    <div className="space-y-1 text-sm">
      <div>{order.customer?.line_name || "-"}</div>
      <div className="text-stone-500">{order.customer?.phone || "-"}</div>
      {order.customer?.note && (
        <div className="mt-2 rounded-lg bg-stone-50 p-2 text-stone-600">{order.customer.note}</div>
      )}
    </div>
  </section>
);

export const BouquetReadCard = ({ order }: { order: OrderRecord }) => {
  const items = order.items ?? [];
  const finishedPhoto = order.attachments?.find((a) => a.label === "รูปช่อที่จัดเสร็จแล้ว");
  const referencePhoto = order.attachments?.find((a) => a.label === "รูปตัวอย่าง");

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-stone-800">ดอกไม้และการ์ด</h3>
      <div className="space-y-2 text-sm">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex justify-between border-b border-stone-100 pb-1 last:border-0">
              <span>{item.flowerType || "-"} · {item.flowerColor || "-"}</span>
              <b>{item.quantity ?? "-"} ดอก</b>
            </div>
          ))
        ) : (
          <p className="text-stone-500">ไม่มีรายการ</p>
        )}
      </div>
      <div className="mt-3 text-sm text-stone-600">
        กระดาษห่อ: {order.paper_color || "-"} · โบว์: {order.bow_color || "-"}
      </div>
      {order.has_card && order.card_message && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">การ์ด: {order.card_message}</div>
      )}
      {(referencePhoto?.src || finishedPhoto?.src) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {referencePhoto?.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={referencePhoto.src} alt="รูปตัวอย่าง" className="h-24 w-full rounded-lg object-cover" />
          )}
          {finishedPhoto?.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={finishedPhoto.src} alt="รูปช่อที่จัดเสร็จแล้ว" className="h-24 w-full rounded-lg object-cover" />
          )}
        </div>
      )}
    </section>
  );
};

export const FulfilmentReadCard = ({ order }: { order: OrderRecord }) => {
  const delivery = getDeliveryInfo(order.delivery_info);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-stone-800">การรับสินค้า</h3>
      <div className="text-sm">
        <div>{order.pickup_mode === "delivery" ? "จัดส่ง" : "รับที่ร้าน"}</div>
        <div className="text-stone-500">
          {formatDate(order.delivery_date)} · {order.delivery_time || "-"}
        </div>
      </div>
      {order.pickup_mode === "delivery" && delivery && (
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
          <div>ผู้รับ: {delivery.recipient_name || "-"}</div>
          <div>เบอร์โทร: {delivery.recipient_phone || "-"}</div>
          <div>ที่อยู่: {delivery.address || "-"}</div>
          {delivery.map_link && (
            <a href={delivery.map_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              เปิดแผนที่
            </a>
          )}
        </div>
      )}
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
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
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
