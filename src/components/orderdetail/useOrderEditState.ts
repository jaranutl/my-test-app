"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { OrderRecord } from "@/components/orderlist/types";
import { ATTACHMENT_LABELS, getDeliveryInfo } from "@/components/orderlist/types";
import type { FlowerFormData, FlowerRow } from "@/components/formorder/types";
import type { UploadedImage as ReferenceImage } from "@/components/formorder/Fileuploader";
import type { UploadedImage as FinishedImage } from "@/components/formorder/FileuploaderActual";
import { deleteOrderImageInline, uploadOrderImageInline } from "@/app/order_list/actions";

const REFERENCE_LABEL = ATTACHMENT_LABELS.reference;
const FINISHED_LABEL = ATTACHMENT_LABELS.finished;

const parseMoney = (value: string) => {
  if (!value.trim()) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

const formatDateForDatabase = (value: string | Date | null) => {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const orderToFlowerForm = (order: OrderRecord): FlowerFormData => {
  const delivery = getDeliveryInfo(order.delivery_info);
  const rows: FlowerRow[] =
    order.items && order.items.length > 0
      ? order.items.map((item, index) => ({
          id: `row-${index}`,
          type: item.flowerType ?? "",
          color: item.flowerColor ?? "",
          quantity: item.quantity ?? 1,
        }))
      : [{ id: "row-0", type: "", color: "", quantity: 1 }];

  return {
    rows,
    hasCard: Boolean(order.has_card),
    cardMessage: order.card_message ?? "",
    paperColor: order.paper_color ?? "",
    bowColor: order.bow_color ?? "",
    bouquetPrice: order.bouquet_price != null ? String(order.bouquet_price) : "",
    deliveryDate: order.delivery_date ? new Date(order.delivery_date) : null,
    deliveryTime: order.delivery_time ?? "",
    pickupMode: order.pickup_mode ?? "workin",
    delivery: {
      recipientName: delivery?.recipient_name ?? "",
      recipientPhone: delivery?.recipient_phone ?? "",
      address: delivery?.address ?? "",
      mapLink: delivery?.map_link ?? "",
      deliveryPrice: delivery?.delivery_price != null ? String(delivery.delivery_price) : "",
    },
  };
};

export const useOrderEditState = (order: OrderRecord) => {
  const attachments = order.attachments ?? [];
  const referenceAttachment = attachments.find((a) => a.label === REFERENCE_LABEL);
  const finishedAttachment = attachments.find((a) => a.label === FINISHED_LABEL);

  const initial = {
    lineName: order.customer?.line_name ?? "",
    phone: order.customer?.phone ?? "",
    note: order.customer?.note ?? "",
    flower: orderToFlowerForm(order),
    referenceImage: referenceAttachment?.full_url || referenceAttachment?.src
      ? { src: referenceAttachment.full_url ?? referenceAttachment.src ?? "", fileName: referenceAttachment.file_name ?? "" }
      : null,
    finishedImage: finishedAttachment?.full_url || finishedAttachment?.src
      ? { src: finishedAttachment.full_url ?? finishedAttachment.src ?? "", fileName: finishedAttachment.file_name ?? "" }
      : null,
  };

  const [lineName, setLineName] = useState(initial.lineName);
  const [phone, setPhone] = useState(initial.phone);
  const [note, setNote] = useState(initial.note);
  const [flower, setFlower] = useState<FlowerFormData>(initial.flower);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(initial.referenceImage);
  const [finishedImage, setFinishedImage] = useState<FinishedImage | null>(initial.finishedImage);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const reset = () => {
    setLineName(initial.lineName);
    setPhone(initial.phone);
    setNote(initial.note);
    setFlower(initial.flower);
    setReferenceImage(initial.referenceImage);
    setFinishedImage(initial.finishedImage);
    setErrorMessage(null);
    setIsSaved(false);
  };

  const handleFlowerRowChange = <K extends keyof FlowerRow>(id: string, field: K, value: FlowerRow[K]) => {
    setFlower((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const handleAddRow = () => {
    setFlower((prev) => {
      if (prev.rows.length >= 4) return prev;
      return { ...prev, rows: [...prev.rows, { id: uuidv4(), type: "", color: "", quantity: 1 }] };
    });
  };

  const handleRemoveRow = (id: string) => {
    setFlower((prev) => {
      if (prev.rows.length <= 1) return prev;
      return { ...prev, rows: prev.rows.filter((row) => row.id !== id) };
    });
  };

  const persistAttachment = async (
    existingId: number | undefined,
    label: string,
    image: { file?: File; fileName: string } | null,
  ) => {
    if (image?.file) {
      const formData = new FormData();
      formData.set("photo", image.file, image.fileName);
      const result = await uploadOrderImageInline(order.id, label, formData);
      if (!result.ok) throw new Error(result.error);
    } else if (!image && existingId) {
      const result = await deleteOrderImageInline(order.id, label);
      if (!result.ok) throw new Error(result.error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    const supabase = supabaseBrowser();

    const orderItems = flower.rows
      .filter((row) => row.type.trim() || row.color.trim())
      .map((row, index) => ({
        lineNo: index + 1,
        flowerType: row.type.trim(),
        flowerColor: row.color.trim(),
        quantity: row.quantity,
      }));

    try {
      if (order.customer_id) {
        const { error: customerError } = await supabase
          .from("customer")
          .update({ line_name: lineName.trim(), phone, note: note.trim() || null })
          .eq("id", order.customer_id);
        if (customerError) throw customerError;
      }

      const { error: orderError } = await supabase
        .from("order")
        .update({
          items: orderItems,
          pickup_mode: flower.pickupMode,
          delivery_date: formatDateForDatabase(flower.deliveryDate),
          delivery_time: flower.deliveryTime || null,
          paper_color: flower.paperColor || null,
          bow_color: flower.bowColor || null,
          bouquet_price: parseMoney(flower.bouquetPrice),
          has_card: flower.hasCard,
          card_message: flower.hasCard ? flower.cardMessage || null : null,
        })
        .eq("id", order.id);
      if (orderError) throw orderError;

      if (flower.pickupMode === "delivery") {
        const existingDelivery = getDeliveryInfo(order.delivery_info);
        const deliveryPayload = {
          order_id: order.id,
          recipient_name: flower.delivery.recipientName || null,
          recipient_phone: flower.delivery.recipientPhone || null,
          address: flower.delivery.address || null,
          map_link: flower.delivery.mapLink || null,
          delivery_price: parseMoney(flower.delivery.deliveryPrice),
        };

        const { error: deliveryError } = existingDelivery?.id
          ? await supabase.from("delivery_info").update(deliveryPayload).eq("id", existingDelivery.id)
          : await supabase.from("delivery_info").insert(deliveryPayload);
        if (deliveryError) throw deliveryError;
      }

      await persistAttachment(referenceAttachment?.id, REFERENCE_LABEL, referenceImage);
      await persistAttachment(finishedAttachment?.id, FINISHED_LABEL, finishedImage);

      setIsSaved(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }

    setIsSaving(false);
  };

  return {
    lineName,
    phone,
    note,
    flower,
    referenceImage,
    finishedImage,
    isSaving,
    errorMessage,
    isSaved,
    setLineName,
    setPhone,
    setNote,
    setFlower,
    setReferenceImage,
    setFinishedImage,
    handleFlowerRowChange,
    handleAddRow,
    handleRemoveRow,
    handleSave,
    reset,
  };
};
