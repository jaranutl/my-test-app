"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Gift, Truck, UserRound } from "lucide-react";
import { CustomerFields } from "./CustomerFields";
import { FlowerItemsFields } from "./FlowerItemsFields";
import { WrapAndCardFields } from "./WrapAndCardFields";
import { FulfilmentFields } from "./FulfilmentFields";
import { StepProgress } from "./StepProgress";
import { WizardStepHeading } from "./WizardStepHeading";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { UploadPic } from "./uploadpic";
import { useOrderFormState } from "./useOrderFormState";
import { isFlowerRowValid } from "./types";

const STEP_TITLES = ["ลูกค้า", "ช่อดอกไม้", "การรับสินค้า", "ตรวจสอบ"];

export type OrderFormWizardProps = {
  onPrintOrder: (orderId: string | number | null | undefined) => void;
};

export const OrderFormWizard = ({ onPrintOrder }: OrderFormWizardProps) => {
  const [step, setStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const state = useOrderFormState(setStatusMessage);

  const isStepValid = (index: number) => {
    if (index === 0) return state.lineName.trim().length > 0 && state.phone.trim().length > 0;
    if (index === 1) return state.flower.rows.every(isFlowerRowValid);
    if (index === 2 && state.flower.pickupMode === "delivery") {
      return (
        state.flower.delivery.recipientName.trim().length > 0 &&
        state.flower.delivery.address.trim().length > 0
      );
    }
    return true;
  };

  const goNext = () => setStep((current) => Math.min(STEP_TITLES.length - 1, current + 1));
  const goBack = () => setStep((current) => Math.max(0, current - 1));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#d34f77]">New order</span>
        <h1 className="mt-2 text-3xl font-semibold">สร้างคำสั่งซื้อใหม่</h1>
        <p className="mt-1 text-sm text-stone-400">ทีละขั้น ใช้เวลาประมาณ 2 นาที</p>
      </div>

      <div className="mb-6">
        <StepProgress steps={STEP_TITLES} currentIndex={step} onStepClick={setStep} />
      </div>

      <section className="min-h-96 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#202a23] sm:p-10">
          {step === 0 && (
            <>
              <WizardStepHeading
                icon={<UserRound />}
                title="ลูกค้าคนนี้คือใคร?"
                note="ใช้สำหรับติดต่อและค้นหาออเดอร์ภายหลัง"
              />
              <CustomerFields
                lineName={state.lineName}
                phone={state.phone}
                note={state.note}
                onLineNameChange={state.setLineName}
                onPhoneChange={state.setPhone}
                onNoteChange={state.setNote}
              />
            </>
          )}

          {step === 1 && (
            <>
              <WizardStepHeading
                icon={<Gift />}
                title="จัดช่อแบบไหนดี?"
                note="เพิ่มดอกไม้ได้สูงสุด 4 ชนิด"
              />
              <FlowerItemsFields
                rows={state.flower.rows}
                bouquetPrice={state.flower.bouquetPrice}
                onRowChange={state.handleFlowerRowChange}
                onAddRow={state.handleAddFlowerRow}
                onRemoveRow={state.handleRemoveFlowerRow}
                onBouquetPriceChange={(value) => state.setFlower((prev) => ({ ...prev, bouquetPrice: value }))}
              />
              <div className="mt-5 border-t border-stone-100 pt-5">
                <WrapAndCardFields
                  paperColor={state.flower.paperColor}
                  bowColor={state.flower.bowColor}
                  hasCard={state.flower.hasCard}
                  cardMessage={state.flower.cardMessage}
                  onPaperColorChange={(value) => state.setFlower((prev) => ({ ...prev, paperColor: value }))}
                  onBowColorChange={(value) => state.setFlower((prev) => ({ ...prev, bowColor: value }))}
                  onHasCardChange={(value) =>
                    state.setFlower((prev) => ({ ...prev, hasCard: value, cardMessage: value ? prev.cardMessage : "" }))
                  }
                  onCardMessageChange={(value) => state.setFlower((prev) => ({ ...prev, cardMessage: value }))}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <WizardStepHeading
                icon={<Truck />}
                title="ลูกค้าจะรับช่ออย่างไร?"
                note="กำหนดรูปแบบ วัน และเวลานัดรับ"
              />
              <FulfilmentFields
                pickupMode={state.flower.pickupMode}
                deliveryDate={state.flower.deliveryDate}
                deliveryTime={state.flower.deliveryTime}
                delivery={state.flower.delivery}
                onPickupModeChange={(value) => state.setFlower((prev) => ({ ...prev, pickupMode: value }))}
                onDeliveryDateChange={(value) => state.setFlower((prev) => ({ ...prev, deliveryDate: value }))}
                onDeliveryTimeChange={(value) => state.setFlower((prev) => ({ ...prev, deliveryTime: value }))}
                onDeliveryFieldChange={(field, value) =>
                  state.setFlower((prev) => ({ ...prev, delivery: { ...prev.delivery, [field]: value } }))
                }
              />
            </>
          )}

          {step === 3 && (
            <div>
              <WizardStepHeading
                icon={<FileText />}
                title="ตรวจสอบก่อนบันทึก"
                note="เช็กข้อมูลให้ครบ แล้วบันทึกและพิมพ์ใบออเดอร์"
              />
              <div className="mx-auto mt-7 max-w-lg space-y-3">
                <OrderSummaryCard lineName={state.lineName} rows={state.flower.rows} flower={state.flower} />
                <UploadPic
                  onSaveOrder={(images) => state.saveOrder(images)}
                  onPrintOrder={onPrintOrder}
                  statusMessage={statusMessage}
                />
              </div>
            </div>
          )}
      </section>

      <div className="mt-5 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={goBack}
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm disabled:opacity-30 dark:border-white/10 dark:bg-white/5"
        >
          <ArrowLeft size={16} /> ย้อนกลับ
        </button>
        {step < STEP_TITLES.length - 1 && (
          <button
            type="button"
            disabled={!isStepValid(step)}
            onClick={goNext}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            ถัดไป <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
