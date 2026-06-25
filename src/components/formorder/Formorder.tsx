"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Formflower } from "./Formflower";
import type { FlowerFormData, FlowerRow } from "./Formflower";

type SavedOrder = {
  orderNo: string;
  lineName: string;
  phone: string;
  flower: FlowerFormData;
  createdAt: string;
};

export type FormorderActions = {
  saveOrder: (images?: PrintableOrderImage[]) => Promise<string | null>;
  printOrder: (images?: PrintableOrderImage[]) => void;
};

export type PrintableOrderImage = {
  label: string;
  src: string;
  fileName: string;
};

type FormorderProps = {
  onStatusChange?: (message: string) => void;
};

const parseMoney = (value: string) => {
  if (!value.trim()) return null;

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

const formatDateForDatabase = (value: string | Date | null) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    return (
      [maybeError.message, maybeError.details, maybeError.hint]
        .filter((value): value is string => typeof value === "string")
        .join(" | ") || JSON.stringify(maybeError)
    );
  }

  return String(error || "ไม่ทราบสาเหตุ");
};

const createEmptyFlowerForm = (): FlowerFormData => ({
  rows: [{ id: uuidv4(), type: "", color: "", quantity: 1 }],
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

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value: string | Date | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

export const Formorder = forwardRef<FormorderActions, FormorderProps>(
  ({ onStatusChange }, ref) => {
    const [lineName, setLineName] = useState("");
    const [orderNo, setOrderNo] = useState("");
    const [phone, setPhone] = useState("");
    const [flower, setFlower] = useState<FlowerFormData>(createEmptyFlowerForm);

    const formatThaiPhone = (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const loadNextOrderNo = async () => {
      const { data, error } = await supabaseBrowser()
        .from("order")
        .select("order_no")
        .order("order_no", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return;

      const latestOrderNo =
        typeof data?.order_no === "number" ? data.order_no : 0;
      setOrderNo(String(latestOrderNo + 1));
    };

    const resetForm = async () => {
      setLineName("");
      setPhone("");
      setFlower(createEmptyFlowerForm());
      await loadNextOrderNo();
    };

    useEffect(() => {
      let isMounted = true;

      const loadInitialOrderNo = async () => {
        const { data, error } = await supabaseBrowser()
          .from("order")
          .select("order_no")
          .order("order_no", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isMounted || error) return;

        const latestOrderNo =
          typeof data?.order_no === "number" ? data.order_no : 0;
        setOrderNo(String(latestOrderNo + 1));
      };

      loadInitialOrderNo();

      return () => {
        isMounted = false;
      };
    }, []);

    const buildOrder = (): SavedOrder => ({
      orderNo: orderNo.trim(),
      lineName: lineName.trim(),
      phone,
      flower,
      createdAt: new Date().toISOString(),
    });

    const handleFlowerRowChange = <K extends keyof FlowerRow>(
      id: string,
      field: K,
      value: FlowerRow[K],
    ) => {
      setFlower((prev) => ({
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === id ? { ...row, [field]: value } : row,
        ),
      }));
    };

    const handleAddFlowerRow = () => {
      setFlower((prev) => {
        if (prev.rows.length >= 4) return prev;

        return {
          ...prev,
          rows: [
            ...prev.rows,
            { id: uuidv4(), type: "", color: "", quantity: 1 },
          ],
        };
      });
    };

    const handleRemoveFlowerRow = (id: string) => {
      setFlower((prev) => {
        if (prev.rows.length <= 1) return prev;

        return {
          ...prev,
          rows: prev.rows.filter((row) => row.id !== id),
        };
      });
    };

    const handleSaveOrder = async (images: PrintableOrderImage[] = []) => {
      const order = buildOrder();
      const supabase = supabaseBrowser();
      const orderItems = order.flower.rows
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
          .insert({
            line_name: order.lineName,
            phone: order.phone,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;

        const { data: savedOrder, error: orderError } = await supabase
          .from("order")
          .insert({
            customer_id: customer.id,
            items: orderItems,
            pickup_mode: order.flower.pickupMode,
            delivery_date: formatDateForDatabase(order.flower.deliveryDate),
            delivery_time: order.flower.deliveryTime || null,
            paper_color: order.flower.paperColor || null,
            bow_color: order.flower.bowColor || null,
            bouquet_price: parseMoney(order.flower.bouquetPrice),
            has_card: order.flower.hasCard,
            card_message: order.flower.hasCard
              ? order.flower.cardMessage || null
              : null,
            created_at: order.createdAt,
          })
          .select("id, order_no")
          .single();

        if (orderError) throw orderError;

        if (order.flower.pickupMode === "delivery") {
          const { error: deliveryError } = await supabase
            .from("delivery_info")
            .insert({
              order_id: savedOrder.id,
              recipient_name: order.flower.delivery.recipientName || null,
              recipient_phone: order.flower.delivery.recipientPhone || null,
              address: order.flower.delivery.address || null,
              map_link: order.flower.delivery.mapLink || null,
              delivery_price: parseMoney(order.flower.delivery.deliveryPrice),
            });

          if (deliveryError) throw deliveryError;
        }

        if (images.length > 0) {
          const { error: attachmentError } = await supabase
            .from("attachments")
            .insert(
              images.map((image) => ({
                order_id: savedOrder.id,
                label: image.label,
                file_name: image.fileName,
                src: image.src,
              })),
            );

          if (attachmentError) throw attachmentError;
        }

        const savedOrderNo = String(savedOrder.order_no || savedOrder.id);

        setOrderNo(savedOrderNo);
        onStatusChange?.(`บันทึกออเดอร์ ${savedOrderNo} แล้ว`);
        await resetForm();
        return savedOrderNo;
      } catch (error) {
        onStatusChange?.(`บันทึกไม่สำเร็จ: ${getErrorMessage(error)}`);
        return null;
      }
    };

    const createPrintHtml = (
      order: SavedOrder,
      images: PrintableOrderImage[] = [],
    ) => {
      const flowerRows = order.flower.rows
        .map(
          (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.type || "-")}</td>
            <td>${escapeHtml(row.color || "-")}</td>
            <td>${escapeHtml(row.quantity)}</td>
          </tr>
        `,
        )
        .join("");

      const delivery = order.flower.delivery;
      const deliverySection =
        order.flower.pickupMode === "delivery"
          ? `
          <section class="compact-section">
            <h2>ข้อมูลจัดส่ง</h2>
            <div class="grid dense-grid">
              <p><strong>ชื่อผู้รับ:</strong> ${escapeHtml(delivery.recipientName || "-")}</p>
              <p><strong>เบอร์โทรผู้รับ:</strong> ${escapeHtml(delivery.recipientPhone || "-")}</p>
              <p><strong>ค่าส่ง:</strong> ${escapeHtml(delivery.deliveryPrice || "0")} บาท</p>
              <p class="span-all"><strong>ที่อยู่จัดส่ง:</strong> ${escapeHtml(delivery.address || "-")}</p>
              <p class="span-all"><strong>ลิงก์แผนที่:</strong> ${escapeHtml(delivery.mapLink || "-")}</p>
            </div>
          </section>
        `
          : "";

      const imageSection =
        images.length > 0
          ? `
          <section class="compact-section image-section">
            <h2>รูปภาพออเดอร์</h2>
            <div class="images">
              ${images
                .map(
                  (image) => `
                    <figure>
                      <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.label)}" />
                      <figcaption>
                        <strong>${escapeHtml(image.label)}</strong>
                        <span>${escapeHtml(image.fileName)}</span>
                      </figcaption>
                    </figure>
                  `,
                )
                .join("")}
            </div>
          </section>
        `
          : "";

      return `
      <!doctype html>
      <html lang="th">
        <head>
          <meta charset="utf-8" />
          <title>ใบออเดอร์ ${escapeHtml(order.orderNo || "draft")}</title>
          <style>
            * { box-sizing: border-box; }
            body { color: #111827; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.28; margin: 0; }
            h1 { font-size: 22px; line-height: 1; margin: 0 0 10px; text-align: center; }
            h2 { border-bottom: 1px solid #d1d5db; font-size: 14px; line-height: 1.15; margin: 10px 0 6px; padding-bottom: 3px; }
            p { margin: 2px 0; }
            table { border-collapse: collapse; margin-top: 5px; table-layout: fixed; width: 100%; }
            th, td { border: 1px solid #d1d5db; padding: 5px 6px; text-align: left; word-break: break-word; }
            th:first-child, td:first-child { text-align: center; width: 28px; }
            th:nth-child(4), td:nth-child(4) { text-align: center; width: 54px; }
            th { background: #f3f4f6; }
            .page { display: flex; flex-direction: column; height: 297mm; overflow: hidden; padding: 10mm; width: 210mm; }
            .compact-section { break-inside: avoid; }
            .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 14px; }
            .dense-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .span-all { grid-column: 1 / -1; }
            .image-section { display: flex; flex: 1; flex-direction: column; min-height: 0; }
            .images { display: grid; flex: 1; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; min-height: 0; }
            figure { break-inside: avoid; display: flex; flex-direction: column; margin: 0; min-height: 0; }
            img { border: 1px solid #d1d5db; display: block; flex: 1; min-height: 86mm; object-fit: contain; width: 100%; }
            figcaption { color: #374151; display: flex; flex-direction: column; font-size: 10px; gap: 1px; margin-top: 4px; }
            .note { border: 1px solid #d1d5db; max-height: 72px; min-height: 42px; overflow: hidden; padding: 6px; white-space: pre-wrap; }
            @page { margin: 0; size: A4; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .page { height: 297mm; }
            }
          </style>
        </head>
        <body>
          <main class="page">
          <h1>ใบออเดอร์</h1>
          <section class="grid">
            <p><strong>เลขที่คำสั่งซื้อ:</strong> ${escapeHtml(order.orderNo || "-")}</p>
            <p><strong>วันที่บันทึก:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>ชื่อ LINE ลูกค้า:</strong> ${escapeHtml(order.lineName || "-")}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> ${escapeHtml(order.phone || "-")}</p>
            <p><strong>วันที่รับช่อ:</strong> ${formatDate(order.flower.deliveryDate)}</p>
            <p><strong>เวลาที่รับช่อ:</strong> ${escapeHtml(order.flower.deliveryTime || "-")}</p>
            <p><strong>วิธีรับช่อ:</strong> ${order.flower.pickupMode === "delivery" ? "ให้จัดส่ง" : "รับช่อที่ร้าน"}</p>
          </section>

          <section class="compact-section">
            <h2>รายละเอียดดอกไม้</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ชนิดดอกไม้</th>
                  <th>สี</th>
                  <th>จำนวน</th>
                </tr>
              </thead>
              <tbody>${flowerRows}</tbody>
            </table>
          </section>

          <section class="grid compact-section">
            <p><strong>สีกระดาษห่อ:</strong> ${escapeHtml(order.flower.paperColor || "-")}</p>
            <p><strong>สีโบว์:</strong> ${escapeHtml(order.flower.bowColor || "-")}</p>
            <p><strong>ราคาช่อ:</strong> ${escapeHtml(order.flower.bouquetPrice || "0")} บาท</p>
          </section>

          ${
            order.flower.hasCard
              ? `<section class="compact-section"><h2>ข้อความการ์ดอวยพร</h2><div class="note">${escapeHtml(order.flower.cardMessage || "-")}</div></section>`
              : ""
          }

          ${deliverySection}

          ${imageSection}
          </main>
        </body>
      </html>
    `;
    };

    const handlePrintOrder = (images: PrintableOrderImage[] = []) => {
      const printWindow = window.open("", "_blank", "width=900,height=700");

      if (!printWindow) {
        onStatusChange?.(
          "ไม่สามารถเปิดหน้าพิมพ์ได้ กรุณาอนุญาต popup ในเบราว์เซอร์",
        );
        return;
      }

      printWindow.document.write(createPrintHtml(buildOrder(), images));
      printWindow.document.close();
      printWindow.focus();
      printWindow.setTimeout(() => printWindow.print(), 300);
    };

    useImperativeHandle(
      ref,
      () => ({
        saveOrder: handleSaveOrder,
        printOrder: handlePrintOrder,
      }),
      [handleSaveOrder, handlePrintOrder],
    );

    return (
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <h2 className="flex-1 text-2xl font-bold text-center">
            สร้างคำสั่งซื้อใหม่
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              เลขที่คำสั่งซื้อ
            </label>
            <input
              type="text"
              value={orderNo}
              readOnly
              placeholder="สร้างอัตโนมัติเมื่อบันทึก"
              className="mt-1 input input-bordered w-auto bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-4 flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ชื่อ LINE ลูกค้า
            </label>
            <input
              type="text"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              className="mt-1 input input-bordered w-auto"
              placeholder="กรอกชื่อ LINE ลูกค้า"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์
            </label>

            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatThaiPhone(e.target.value))}
              placeholder="xxx-xxx-xxxx"
              className="mt-1 input input-bordered w-full max-w-xs"
            />
          </div>
        </div>

        <div className="mt-4">
          <Formflower
            value={flower}
            onChange={setFlower}
            onAddRow={handleAddFlowerRow}
            onRemoveRow={handleRemoveFlowerRow}
            onRowChange={handleFlowerRowChange}
          />
        </div>
      </div>
    );
  },
);

Formorder.displayName = "Formorder";
