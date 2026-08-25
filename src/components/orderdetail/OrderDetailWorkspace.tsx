"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Pencil, Printer } from "lucide-react";
import { ORDER_STATUS_STEPS, getStatusIndex, getStatusStep } from "@/lib/orderStatus";
import { formatOrderTime } from "@/lib/orderPresentation";
import { ATTACHMENT_LABELS, findAttachment, getOrderTotal } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import { CustomerReadCard, BouquetReadCard, FulfilmentReadCard } from "./OrderReadCards";
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

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
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
  const statusStep = getStatusStep(order.status);
  const { total } = getOrderTotal(order);
  const router = useRouter();
  const editState = useOrderEditState(order);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-800 dark:bg-[#161d18] dark:text-stone-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#202a23] lg:px-9">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/order_list")}
            className="grid size-10 place-items-center rounded-xl border border-stone-200 text-stone-500 dark:border-white/10 dark:text-stone-300"
            aria-label="กลับไปหน้ารายการ"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <p className="text-xs text-stone-400">รายการคำสั่งซื้อ / #{order.order_no ?? order.id}</p>
            <h1 className="font-semibold">ออเดอร์ #{order.order_no ?? order.id}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/order_print/${order.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
            <Printer size={15} /> พิมพ์
          </a>
          <button
            type="button"
            onClick={() => {
              if (isEditing) editState.reset();
              setIsEditing((v) => !v);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white"
          >
            <Pencil size={15} /> {isEditing ? "ยกเลิกแก้ไข" : "แก้ไข"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 lg:p-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c] sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              {statusStep && <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStep.badgeClass}`}>{statusStep.label}</span>}
              <h2 className="mt-3 text-2xl font-semibold dark:text-stone-100">{order.customer?.line_name || "ไม่ระบุชื่อลูกค้า"}</h2>
              <p className="mt-1 text-sm text-stone-400">นัด{order.pickup_mode === "delivery" ? "จัดส่ง" : "รับ"} {formatDate(order.delivery_date)} · {formatOrderTime(order.delivery_time)}</p>
            </div>
            <div className="text-right"><p className="text-xs text-stone-400">ยอดรวมสุทธิ</p><b className="text-3xl dark:text-stone-100">฿{total.toLocaleString("th-TH")}</b></div>
          </div>
          <form action={updateStatusAction} className="grid grid-cols-3 gap-y-4 sm:grid-cols-6">
            {ORDER_STATUS_STEPS.map((step, index) => (
              <button
                key={step.value}
                type="submit"
                name="status"
                value={step.value}
                disabled={step.value === order.status}
                className="relative flex flex-col items-center gap-2 text-center disabled:cursor-default"
              >
                <span className={`z-10 grid size-8 place-items-center rounded-full border-2 text-xs font-semibold ${index < stepIndex ? "border-[#dd5f83] bg-[#dd5f83] text-white" : index === stepIndex ? "border-[#dd5f83] bg-white text-[#dd5f83] dark:bg-[#1a211c]" : "border-stone-200 bg-[#faf9f7] text-stone-300 dark:border-white/10 dark:bg-[#161d18] dark:text-stone-500"}`}>
                  {index < stepIndex ? <Check size={14} /> : index + 1}
                </span>
                <span className={`text-[11px] ${index === stepIndex ? "font-semibold text-stone-800 dark:text-stone-100" : "text-stone-400"}`}>{step.label}</span>
                {index < ORDER_STATUS_STEPS.length - 1 && <span className={`absolute left-1/2 top-4 h-0.5 w-full ${index < stepIndex ? "bg-[#dd5f83]" : "bg-stone-200 dark:bg-white/10"}`} />}
              </button>
            ))}
          </form>
        </section>

      {isEditing ? (
        <div className="mt-5 space-y-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
            <h3 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">ลูกค้า</h3>
            <CustomerFields
              lineName={editState.lineName}
              phone={editState.phone}
              note={editState.note}
              onLineNameChange={editState.setLineName}
              onPhoneChange={editState.setPhone}
              onNoteChange={editState.setNote}
            />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
            <h3 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">ดอกไม้และการ์ด</h3>
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

          <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
            <h3 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">การรับสินค้า</h3>
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

          <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#1a211c]">
            <h3 className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">รูปภาพ</h3>
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
              className="rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ca5277] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editState.isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_360px]">
          <BouquetReadCard order={order} />
          <aside className="space-y-4">
            <CustomerReadCard order={order} />
            <FulfilmentReadCard order={order} />
          </aside>
        </div>
      )}

      {(order.status === "wrapping" || order.status === "ready_for_delivery") && (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/30 p-5 dark:border-rose-300/20 dark:bg-rose-300/5">
          <div className="mb-2 text-sm font-semibold text-stone-700 dark:text-stone-200">รูปช่อที่จัดเสร็จแล้ว</div>
          <form action={uploadFinishedPhotoAction} className="flex flex-wrap items-center gap-2">
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" capture="environment" className="file-input file-input-sm" />
            <button type="submit" className="rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white">
              {finishedPhoto ? "แก้ไขรูป" : "อัปโหลดรูป"}
            </button>
          </form>
        </div>
      )}

      {order.status === "ready_for_delivery" && order.pickup_mode === "delivery" && (
        <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-300/20 dark:bg-amber-400/10">
          <div className="mb-2 text-sm font-semibold text-stone-700 dark:text-stone-200">แจ้งเรียก Grab</div>
          <form action={handoffToGrabAction}>
            <button type="submit" disabled={!finishedPhoto?.full_url && !finishedPhoto?.src} className="rounded-xl bg-[#dd5f83] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              แจ้งเรียก Grab
            </button>
          </form>
          {!finishedPhoto?.full_url && !finishedPhoto?.src && (
            <p className="mt-2 text-xs text-red-600">ต้องอัปโหลดรูปช่อที่จัดเสร็จแล้วก่อนจึงจะแจ้งเรียก Grab ได้</p>
          )}
        </div>
      )}

      {order.status === "out_for_delivery" && (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/30 p-5 dark:border-rose-300/20 dark:bg-rose-300/5">
          <div className="mb-2 text-sm font-semibold text-stone-700 dark:text-stone-200">รูปส่งมอบ</div>
          <form action={uploadDeliveredPhotoAction} className="flex flex-wrap items-center gap-2">
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" capture="environment" className="file-input file-input-sm" />
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              บันทึกและทำเครื่องหมายว่าส่งสำเร็จ
            </button>
          </form>
          <p className="mt-2 text-xs text-stone-500">หลังบันทึก เปิดรูปในแท็บนี้แล้วส่งให้ลูกค้าทาง LINE ด้วยตนเอง</p>
        </div>
      )}
      </main>
    </div>
  );
};
