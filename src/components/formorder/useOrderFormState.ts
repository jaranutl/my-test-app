"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { uploadOrderImageInline } from "@/app/order_list/actions";
import type { FlowerFormData, FlowerRow } from "./types";
import { createEmptyFlowerRow } from "./types";

export type SavedOrderResult = {
  orderId: string | number;
  orderNo: string | number;
};

export type PrintableOrderImage = {
  label: string;
  src: string;
  fileName: string;
  file: File;
};

const createEmptyFlowerForm = (): FlowerFormData => ({
  rows: [createEmptyFlowerRow(uuidv4())],
  hasCard: false,
  cardMessage: "",
  paperColor: "",
  bowColor: "",
  bouquetPrice: "",
  deliveryDate: null,
  deliveryTime: "",
  pickupMode: "workin",
  delivery: {
    recipientName: "",
    recipientPhone: "",
    address: "",
    mapLink: "",
    deliveryPrice: "",
  },
});

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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; details?: unknown; hint?: unknown };
    return (
      [maybeError.message, maybeError.details, maybeError.hint]
        .filter((value): value is string => typeof value === "string")
        .join(" | ") || JSON.stringify(maybeError)
    );
  }
  return String(error || "ไม่ทราบสาเหตุ");
};

export const useOrderFormState = (onStatusChange?: (message: string) => void) => {
  const [lineName, setLineName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [flower, setFlower] = useState<FlowerFormData>(createEmptyFlowerForm);

  const resetForm = () => {
    setLineName("");
    setPhone("");
    setNote("");
    setFlower(createEmptyFlowerForm());
  };

  const handleFlowerRowChange = <K extends keyof FlowerRow>(id: string, field: K, value: FlowerRow[K]) => {
    setFlower((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const handleAddFlowerRow = () => {
    setFlower((prev) => {
      if (prev.rows.length >= 4) return prev;
      return { ...prev, rows: [...prev.rows, createEmptyFlowerRow(uuidv4())] };
    });
  };

  const handleRemoveFlowerRow = (id: string) => {
    setFlower((prev) => {
      if (prev.rows.length <= 1) return prev;
      return { ...prev, rows: prev.rows.filter((row) => row.id !== id) };
    });
  };

  const saveOrder = async (images: PrintableOrderImage[] = []): Promise<SavedOrderResult | null> => {
    const supabase = supabaseBrowser();
    const orderItems = flower.rows
      .filter((row) => row.type.trim() || row.color.trim())
      .map((row, index) => ({
        lineNo: index + 1,
        flowerType: row.type.trim(),
        flowerColor: row.color.trim(),
        quantity: row.quantity,
      }));

    onStatusChange?.("กำลังบันทึกออเดอร์...");

    try {
      const { data: customer, error: customerError } = await supabase
        .from("customer")
        .insert({ line_name: lineName.trim(), phone, note: note.trim() || null })
        .select("id")
        .single();

      if (customerError || !customer) {
        throw new Error(`บันทึกลูกค้าไม่สำเร็จ: ${getErrorMessage(customerError)}`);
      }

      const { data: savedOrder, error: orderError } = await supabase
        .from("order")
        .insert({
          customer_id: customer.id,
          items: orderItems,
          pickup_mode: flower.pickupMode,
          delivery_date: formatDateForDatabase(flower.deliveryDate),
          delivery_time: flower.deliveryTime || null,
          paper_color: flower.paperColor || null,
          bow_color: flower.bowColor || null,
          bouquet_price: parseMoney(flower.bouquetPrice),
          has_card: flower.hasCard,
          card_message: flower.hasCard ? flower.cardMessage || null : null,
          created_at: new Date().toISOString(),
        })
        .select("id, order_no")
        .single();

      if (orderError || !savedOrder) {
        throw new Error(`บันทึกออเดอร์ไม่สำเร็จ: ${getErrorMessage(orderError)}`);
      }

      if (flower.pickupMode === "delivery") {
        const { error: deliveryError } = await supabase.from("delivery_info").insert({
          order_id: savedOrder.id,
          recipient_name: flower.delivery.recipientName || null,
          recipient_phone: flower.delivery.recipientPhone || null,
          address: flower.delivery.address || null,
          map_link: flower.delivery.mapLink || null,
          delivery_price: parseMoney(flower.delivery.deliveryPrice),
        });
        if (deliveryError) {
          throw new Error(`บันทึกข้อมูลจัดส่งไม่สำเร็จ: ${getErrorMessage(deliveryError)}`);
        }
      }

      for (const image of images) {
        const formData = new FormData();
        formData.set("photo", image.file, image.fileName);
        const upload = await uploadOrderImageInline(savedOrder.id, image.label, formData);
        if (!upload.ok) throw new Error(upload.error);
      }

      const savedOrderNo = String(savedOrder.order_no || savedOrder.id);
      onStatusChange?.(`บันทึกออเดอร์ ${savedOrderNo} แล้ว`);
      resetForm();
      return { orderId: savedOrder.id, orderNo: savedOrderNo };
    } catch (error) {
      onStatusChange?.(`บันทึกไม่สำเร็จ: ${getErrorMessage(error)}`);
      return null;
    }
  };

  return {
    lineName,
    phone,
    note,
    flower,
    setLineName,
    setPhone,
    setNote,
    setFlower,
    handleFlowerRowChange,
    handleAddFlowerRow,
    handleRemoveFlowerRow,
    saveOrder,
  };
};
