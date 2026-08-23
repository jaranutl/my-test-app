"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepProgress } from "@/components/formorder/StepProgress";
import { ORDER_STATUS_STEPS, getStatusIndex } from "@/lib/orderStatus";
import { ATTACHMENT_LABELS, findAttachment } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import { CustomerReadCard, BouquetReadCard, FulfilmentReadCard, PaymentSummaryCard } from "./OrderReadCards";
import { CustomerFields } from "@/components/formorder/CustomerFields";
import { FlowerItemsFields } from "@/components/formorder/FlowerItemsFields";
import { WrapAndCardFields } from "@/components/formorder/WrapAndCardFields";
import { FulfilmentFields } from "@/components/formorder/FulfilmentFields";
import FileUploader from "@/components/formorder/Fileuploader";
import FileUploaderActual from "@/components/formorder/FileuploaderActual";
import { useOrderEditState } from "./useOrderEditState";

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
  const editState = useOrderEditState(order);

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
          <button
            type="button"
            onClick={() => {
              if (isEditing) editState.reset();
              setIsEditing((v) => !v);
            }}
            className="btn btn-sm btn-primary text-white"
          >
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

      {isEditing ? (
        <div className="space-y-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-stone-800">ลูกค้า</h3>
            <CustomerFields
              lineName={editState.lineName}
              phone={editState.phone}
              note={editState.note}
              onLineNameChange={editState.setLineName}
              onPhoneChange={editState.setPhone}
              onNoteChange={editState.setNote}
            />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-stone-800">ดอกไม้และการ์ด</h3>
            <FlowerItemsFields
              rows={editState.flower.rows}
              bouquetPrice={editState.flower.bouquetPrice}
              onRowChange={editState.handleFlowerRowChange}
              onAddRow={editState.handleAddRow}
              onRemoveRow={editState.handleRemoveRow}
              onBouquetPriceChange={(value) => editState.setFlower((prev) => ({ ...prev, bouquetPrice: value }))}
            />
            <div className="mt-4 border-t border-stone-100 pt-4">
              <WrapAndCardFields
                paperColor={editState.flower.paperColor}
                bowColor={editState.flower.bowColor}
                hasCard={editState.flower.hasCard}
                cardMessage={editState.flower.cardMessage}
                onPaperColorChange={(value) => editState.setFlower((prev) => ({ ...prev, paperColor: value }))}
                onBowColorChange={(value) => editState.setFlower((prev) => ({ ...prev, bowColor: value }))}
                onHasCardChange={(value) =>
                  editState.setFlower((prev) => ({ ...prev, hasCard: value, cardMessage: value ? prev.cardMessage : "" }))
                }
                onCardMessageChange={(value) => editState.setFlower((prev) => ({ ...prev, cardMessage: value }))}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-stone-800">การรับสินค้า</h3>
            <FulfilmentFields
              pickupMode={editState.flower.pickupMode}
              deliveryDate={editState.flower.deliveryDate}
              deliveryTime={editState.flower.deliveryTime}
              delivery={editState.flower.delivery}
              onPickupModeChange={(value) => editState.setFlower((prev) => ({ ...prev, pickupMode: value }))}
              onDeliveryDateChange={(value) => editState.setFlower((prev) => ({ ...prev, deliveryDate: value }))}
              onDeliveryTimeChange={(value) => editState.setFlower((prev) => ({ ...prev, deliveryTime: value }))}
              onDeliveryFieldChange={(field, value) =>
                editState.setFlower((prev) => ({ ...prev, delivery: { ...prev.delivery, [field]: value } }))
              }
            />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-stone-800">รูปภาพ</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileUploader onImageChange={editState.setReferenceImage} initialImage={editState.referenceImage} />
              <FileUploaderActual onImageChange={editState.setFinishedImage} initialImage={editState.finishedImage} />
            </div>
          </section>

          {editState.errorMessage && (
            <p className="text-sm font-medium text-red-600">{editState.errorMessage}</p>
          )}
          {editState.isSaved && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              บันทึกการแก้ไขแล้ว
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={async () => {
                await editState.handleSave();
                setIsEditing(false);
                router.refresh();
              }}
              disabled={editState.isSaving}
              className="btn btn-primary text-white"
            >
              {editState.isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomerReadCard order={order} />
          <FulfilmentReadCard order={order} />
          <BouquetReadCard order={order} />
          <PaymentSummaryCard order={order} />
        </div>
      )}

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
