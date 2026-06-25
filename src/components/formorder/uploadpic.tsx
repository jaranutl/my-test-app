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

    if (referenceImage) {
      images.push({
        label: "รูปตัวอย่าง",
        src: referenceImage.src,
        fileName: referenceImage.fileName,
      });
    }

    if (actualImage) {
      images.push({
        label: "รูปช่อที่จัดเสร็จแล้ว",
        src: actualImage.src,
        fileName: actualImage.fileName,
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
    <div className="flex w-full flex-col gap-3">
      <div className="card bg-base-200 rounded-box grid h-auto place-items-center">
        <FileUploader
          onImageChange={setReferenceImage}
          resetToken={resetToken}
        />
      </div>
      <div className="divider"></div>
      <div className="card bg-base-200 rounded-box grid h-auto place-items-center">
        <FileUploaderActual
          onImageChange={setActualImage}
          resetToken={resetToken}
        />
      </div>

      {statusMessage && (
        <p className="text-center text-sm font-medium text-emerald-700">
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSaveOrder}
        disabled={isSaving}
        className="btn btn-soft btn-primary"
      >
        <SaveIcon fontSize="small" />
        {isSaving ? "กำลังบันทึก..." : "บันทึกออเดอร์"}
      </button>
      <button
        type="button"
        onClick={() => onPrintOrder(lastSavedOrder?.orderId)}
        disabled={!lastSavedOrder}
        className="btn btn-soft btn-secondary"
      >
        <PrintIcon fontSize="small" />
        {lastSavedOrder
          ? `พิมพ์ใบออเดอร์ #${lastSavedOrder.orderNo}`
          : "พิมพ์ใบออเดอร์"}
      </button>

      {savedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-2xl">
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
                className="btn btn-primary flex-1 text-white"
              >
                <PrintIcon fontSize="small" />
                พิมพ์ใบออเดอร์
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline flex-1"
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
