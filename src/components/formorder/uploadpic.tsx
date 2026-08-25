"use client";

import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import React, { useMemo, useState } from "react";
import type { SavedOrderResult } from "./Formorder";
import FileUploader from "./Fileuploader";
import type { UploadedImage as UploadedReferenceImage } from "./Fileuploader";
import FileUploaderActual from "./FileuploaderActual";
import type { UploadedImage as UploadedActualImage } from "./FileuploaderActual";

export type PrintableOrderImage = {
  label: string;
  src: string;
  fileName: string;
  file: File;
};

type UploadPicProps = {
  onSaveOrder: (
    images: PrintableOrderImage[],
  ) => Promise<SavedOrderResult | null> | null | undefined;
  onPrintOrder: (orderId: string | number | null | undefined) => void;
  statusMessage?: string;
};

export const UploadPic = ({
  onSaveOrder,
  onPrintOrder,
  statusMessage,
}: UploadPicProps) => {
  const [referenceImage, setReferenceImage] =
    useState<UploadedReferenceImage | null>(null);
  const [actualImage, setActualImage] = useState<UploadedActualImage | null>(
    null,
  );
  const [savedOrder, setSavedOrder] = useState<SavedOrderResult | null>(null);
  const [lastSavedOrder, setLastSavedOrder] =
    useState<SavedOrderResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const printableImages = useMemo(() => {
    const images: PrintableOrderImage[] = [];

    if (referenceImage?.file) {
      images.push({
        label: "รูปตัวอย่าง",
        src: referenceImage.src,
        fileName: referenceImage.fileName,
        file: referenceImage.file,
      });
    }

    if (actualImage?.file) {
      images.push({
        label: "รูปช่อที่จัดเสร็จแล้ว",
        src: actualImage.src,
        fileName: actualImage.fileName,
        file: actualImage.file,
      });
    }

    return images;
  }, [actualImage, referenceImage]);

  const handleSaveOrder = async () => {
    setIsSaving(true);

    const nextSavedOrder = await onSaveOrder(printableImages);

    setIsSaving(false);

    if (nextSavedOrder) {
      setSavedOrder(nextSavedOrder);
      setLastSavedOrder(nextSavedOrder);
    }
  };

  const handlePrintFromModal = () => {
    onPrintOrder(savedOrder?.orderId);
    setSavedOrder(null);
    setReferenceImage(null);
    setActualImage(null);
    setResetToken((current) => current + 1);
  };

  const handleCloseModal = () => {
    setSavedOrder(null);
    setReferenceImage(null);
    setActualImage(null);
    setResetToken((current) => current + 1);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div><p className="text-[10px] font-bold tracking-wider text-stone-300">IMAGES</p><h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">รูปภาพประกอบออเดอร์</h2></div>
          <span className="text-[10px] text-stone-400">ไม่บังคับ</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50">
            <FileUploader key={`reference-${resetToken}`} onImageChange={setReferenceImage} />
          </div>
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50">
            <FileUploaderActual key={`actual-${resetToken}`} onImageChange={setActualImage} />
          </div>
        </div>
      </section>

      {statusMessage && (
        <p className="text-center text-sm font-medium text-emerald-700">
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSaveOrder}
        disabled={isSaving}
        className="btn border-0 bg-[#dd5f83] text-white shadow-sm hover:bg-[#ca5277]"
      >
        <SaveIcon fontSize="small" />
        {isSaving ? "กำลังบันทึก..." : "บันทึกออเดอร์"}
      </button>
      <button
        type="button"
        onClick={() => onPrintOrder(lastSavedOrder?.orderId)}
        disabled={!lastSavedOrder}
        className="btn border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
      >
        <PrintIcon fontSize="small" />
        {lastSavedOrder
          ? `พิมพ์ใบออเดอร์ #${lastSavedOrder.orderNo}`
          : "พิมพ์ใบออเดอร์"}
      </button>

      {savedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <SaveIcon fontSize="medium" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              บันทึกออเดอร์สำเร็จ
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              ออเดอร์เลขที่{" "}
              <span className="font-bold text-gray-900">
                {savedOrder.orderNo}
              </span>{" "}
              ได้บันทึกแล้ว
            </p>
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              กรุณาพิมพ์ใบออเดอร์เพื่อแนบกับรายการนี้
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrintFromModal}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-3 text-sm font-semibold text-white"
              >
                <PrintIcon fontSize="small" />
                พิมพ์ใบออเดอร์
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
