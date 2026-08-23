"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepProgress } from "@/components/formorder/StepProgress";
import { ORDER_STATUS_STEPS, getStatusIndex } from "@/lib/orderStatus";
import { ATTACHMENT_LABELS, findAttachment } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import { CustomerReadCard, BouquetReadCard, FulfilmentReadCard, PaymentSummaryCard } from "./OrderReadCards";

export type OrderDetailWorkspaceProps = {
  order: OrderRecord;
  updateStatusAction: (formData: FormData) => void;
  handoffToGrabAction: (formData: FormData) => void;
  uploadFinishedPhotoAction: (formData: FormData) => void;
  uploadDeliveredPhotoAction: (formData: FormData) => void;
};

export const OrderDetailWorkspace = ({
  order,
  updateStatusAction,
  handoffToGrabAction,
  uploadFinishedPhotoAction,
  uploadDeliveredPhotoAction,
}: OrderDetailWorkspaceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const stepIndex = Math.max(0, getStatusIndex(order.status));
  const finishedPhoto = findAttachment(order.attachments, ATTACHMENT_LABELS.finished);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">ออเดอร์ #{order.order_no ?? order.id}</h2>
          <p className="text-sm text-stone-500">
            นัดรับ {order.delivery_date ?? "-"} {order.delivery_time ?? ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsEditing((v) => !v)} className="btn btn-sm btn-primary text-white">
            {isEditing ? "ยกเลิกแก้ไข" : "แก้ไข"}
          </button>
          <a href={`/order_print/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
            พิมพ์
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/order_list");
              }
            }}
            className="btn btn-sm btn-outline"
          >
            กลับไปที่รายการออเดอร์
          </button>
        </div>
      </div>

      <div className="mb-6">
        <StepProgress steps={ORDER_STATUS_STEPS.map((s) => s.label)} currentIndex={stepIndex} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomerReadCard order={order} />
        <FulfilmentReadCard order={order} />
        <BouquetReadCard order={order} />
        <PaymentSummaryCard order={order} />
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-2 text-sm font-semibold text-stone-700">เปลี่ยนสถานะ</div>
        <form action={updateStatusAction} className="flex flex-wrap items-center gap-2">
          <select name="status" defaultValue={order.status} className="select select-bordered select-sm w-56">
            {ORDER_STATUS_STEPS.map((statusStep) => (
              <option key={statusStep.value} value={statusStep.value}>
                {statusStep.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-sm btn-primary text-white">
            อัปเดตสถานะ
          </button>
        </form>
      </div>

      {order.status === "ready_for_delivery" && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="mb-2 text-sm font-semibold text-stone-700">รูปช่อที่จัดเสร็จแล้ว</div>
          <form action={uploadFinishedPhotoAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
            <input type="file" name="photo" accept="image/*" className="file-input file-input-sm" />
            <button type="submit" className="btn btn-sm btn-info text-white">
              {finishedPhoto ? "แก้ไขรูป" : "อัปโหลดรูป"}
            </button>
          </form>
        </div>
      )}

      {order.status === "ready_for_delivery" && order.pickup_mode === "delivery" && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="mb-2 text-sm font-semibold text-stone-700">แจ้งเรียก Grab</div>
          <form action={handoffToGrabAction}>
            <button type="submit" disabled={!finishedPhoto?.src} className="btn btn-sm btn-accent text-white">
              แจ้งเรียก Grab
            </button>
          </form>
          {!finishedPhoto?.src && (
            <p className="mt-2 text-xs text-red-600">ต้องอัปโหลดรูปช่อที่จัดเสร็จแล้วก่อนจึงจะแจ้งเรียก Grab ได้</p>
          )}
        </div>
      )}

      {order.status === "out_for_delivery" && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="mb-2 text-sm font-semibold text-stone-700">รูปส่งมอบ</div>
          <form action={uploadDeliveredPhotoAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
            <input type="file" name="photo" accept="image/*" className="file-input file-input-sm" />
            <button type="submit" className="btn btn-sm btn-success text-white">
              บันทึกและทำเครื่องหมายว่าส่งสำเร็จ
            </button>
          </form>
          <p className="mt-2 text-xs text-stone-500">หลังบันทึก เปิดรูปในแท็บนี้แล้วส่งให้ลูกค้าทาง LINE ด้วยตนเอง</p>
        </div>
      )}
    </div>
  );
};
