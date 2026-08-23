import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { AutoPrint } from "./AutoPrint";
import { getStatusStep } from "@/lib/orderStatus";
import { ORDER_SELECT, getDeliveryInfo } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";

type PrintOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(amount);
};

export default async function PrintOrderPage({
  params,
}: PrintOrderPageProps) {
  const { orderId } = await params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("order")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single<OrderRecord>();

  if (error || !data) {
    notFound();
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const delivery = getDeliveryInfo(data.delivery_info);
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  const isDelivery = data.pickup_mode === "delivery";
  const bouquetPrice = Number(data.bouquet_price || 0);
  const deliveryPrice = isDelivery ? Number(delivery?.delivery_price || 0) : 0;
  const grandTotal = bouquetPrice + deliveryPrice;
  const statusStep = getStatusStep(data.status);

  return (
    <>
      <AutoPrint />

      <style>{`
        nav, footer { display: none !important; }
        body { background: #f3f4f6; }

        .print-sheet {
          background: #ffffff;
          color: #111827;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
          font-size: 12px;
          height: 297mm;
          line-height: 1.28;
          margin: 12px auto;
          overflow: hidden;
          padding: 10mm;
          width: 210mm;
        }

        .print-title {
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
          margin: 0 0 10px;
          text-align: center;
        }

        .print-header {
          align-items: flex-start;
          border-bottom: 2px solid #dd5f83;
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 9px;
        }

        .print-brand {
          color: #b44767;
          font-size: 11px;
          letter-spacing: .12em;
          margin: 0 0 4px;
          text-transform: uppercase;
        }

        .print-header .print-title {
          margin: 0;
          text-align: left;
        }

        .print-order-no {
          color: #b44767;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          text-align: right;
        }

        .print-status {
          background: #fff1f4;
          border: 1px solid #f1a8bc;
          border-radius: 999px;
          color: #9f3e5d;
          display: inline-block;
          font-size: 10px;
          margin-top: 4px;
          padding: 3px 7px;
        }

        .print-section {
          break-inside: avoid;
        }

        .print-section h2 {
          border-bottom: 1px solid #f3c4d1;
          color: #9f3e5d;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.15;
          margin: 10px 0 6px;
          padding-bottom: 3px;
        }

        .print-grid {
          display: grid;
          gap: 4px 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .print-grid p,
        .print-card p {
          margin: 2px 0;
        }

        .span-all {
          grid-column: 1 / -1;
        }

        .print-table {
          border-collapse: collapse;
          margin-top: 5px;
          table-layout: fixed;
          width: 100%;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #d1d5db;
          padding: 5px 6px;
          text-align: left;
          word-break: break-word;
        }

        .print-table th:first-child,
        .print-table td:first-child {
          text-align: center;
          width: 28px;
        }

        .print-table th:nth-child(4),
        .print-table td:nth-child(4) {
          text-align: center;
          width: 54px;
        }

        .print-table th {
          background: #fff1f4;
          color: #85334f;
        }

        .print-note {
          background: #fffafb;
          border: 1px solid #f3c4d1;
          max-height: 72px;
          min-height: 42px;
          overflow: hidden;
          padding: 6px;
          white-space: pre-wrap;
        }

        .print-total-box {
          background: #fff8fa;
          border: 2px solid #dd5f83;
          margin-left: auto;
          margin-top: 10px;
          padding: 7px 10px;
          width: 270px;
        }

        .print-total-row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }

        .print-total-row.grand {
          border-top: 1px solid #e96a8d;
          color: #9f3e5d;
          font-size: 15px;
          font-weight: 700;
          margin-top: 5px;
          padding-top: 5px;
        }

        .print-checks {
          display: grid;
          gap: 6px 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .print-check {
          align-items: center;
          display: flex;
          gap: 6px;
        }

        .print-checkbox {
          border: 1px solid #dd5f83;
          display: inline-block;
          height: 12px;
          width: 12px;
        }

        .print-signatures {
          display: grid;
          gap: 30px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 18px;
        }

        .print-signature {
          border-top: 1px solid #6b7280;
          padding-top: 4px;
          text-align: center;
        }

        .image-section {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
        }

        .print-images {
          display: grid;
          flex: 1;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          min-height: 0;
        }

        .print-figure {
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          margin: 0;
          min-height: 0;
        }

        .print-figure img {
          border: 1px solid #d1d5db;
          display: block;
          flex: 1;
          min-height: 48mm;
          max-height: 66mm;
          object-fit: contain;
          width: 100%;
        }

        .print-figure figcaption {
          color: #374151;
          display: flex;
          flex-direction: column;
          font-size: 10px;
          gap: 1px;
          margin-top: 4px;
        }

        .print-toolbar {
          display: flex;
          justify-content: center;
          margin: 16px auto 0;
          width: 210mm;
        }

        @page {
          margin: 0;
          size: A4;
        }

        @media print {
          body {
            background: #ffffff;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print-toolbar {
            display: none;
          }

          .print-sheet {
            height: 297mm;
            margin: 0;
          }
        }
      `}</style>

      <div className="print-toolbar">
        <p className="rounded-md bg-white px-4 py-2 text-sm font-medium shadow">
          หน้าต่างนี้จะเปิดพิมพ์อัตโนมัติ
        </p>
      </div>

      <main className="print-sheet">
        <header className="print-header print-section">
          <div>
            <p className="print-brand">SweetPea Flower Studio</p>
            <h1 className="print-title">ใบคำสั่งซื้อ</h1>
          </div>
          <div>
            <p className="print-order-no">#{data.order_no ?? data.id}</p>
            <span className="print-status">{statusStep?.label || data.status}</span>
          </div>
        </header>

        <section className="print-grid print-section">
          <p>
            <strong>เลขที่คำสั่งซื้อ:</strong> {data.order_no ?? "-"}
          </p>
          <p>
            <strong>วันที่บันทึก:</strong> {formatDateTime(data.created_at)}
          </p>
          <p>
            <strong>ชื่อ LINE ลูกค้า:</strong>{" "}
            {data.customer?.line_name || "-"}
          </p>
          <p>
            <strong>เบอร์โทรศัพท์:</strong> {data.customer?.phone || "-"}
          </p>
          <p>
            <strong>วันที่รับช่อ:</strong> {formatDate(data.delivery_date)}
          </p>
          <p>
            <strong>เวลาที่รับช่อ:</strong> {data.delivery_time || "-"}
          </p>
          <p>
            <strong>วิธีรับช่อ:</strong>{" "}
            {isDelivery ? "ให้จัดส่ง" : "รับช่อที่ร้าน"}
          </p>
          <p>
            <strong>สถานะ:</strong> {statusStep?.label || data.status}
          </p>
        </section>

        <section className="print-section">
          <h2>รายละเอียดดอกไม้</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ชนิดดอกไม้</th>
                <th>สี</th>
                <th>จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={`${item.flowerType}-${item.flowerColor}-${index}`}>
                    <td>{item.lineNo ?? index + 1}</td>
                    <td>{item.flowerType || "-"}</td>
                    <td>{item.flowerColor || "-"}</td>
                    <td>{item.quantity ?? 1}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="print-grid print-section">
          <p>
            <strong>สีกระดาษห่อ:</strong> {data.paper_color || "-"}
          </p>
          <p>
            <strong>สีโบว์:</strong> {data.bow_color || "-"}
          </p>
          <p>
            <strong>ราคาช่อ:</strong> {formatMoney(data.bouquet_price)} บาท
          </p>
        </section>

        {data.has_card && (
          <section className="print-section">
            <h2>ข้อความการ์ดอวยพร</h2>
            <div className="print-note">{data.card_message || "-"}</div>
          </section>
        )}

        {isDelivery && (
          <section className="print-section">
            <h2>ข้อมูลจัดส่ง</h2>
            <div className="print-grid">
              <p>
                <strong>ชื่อผู้รับ:</strong>{" "}
                {delivery?.recipient_name || "-"}
              </p>
              <p>
                <strong>เบอร์โทรผู้รับ:</strong>{" "}
                {delivery?.recipient_phone || "-"}
              </p>
              <p>
                <strong>ค่าส่ง:</strong>{" "}
                {formatMoney(delivery?.delivery_price)} บาท
              </p>
              <p className="span-all">
                <strong>ที่อยู่จัดส่ง:</strong> {delivery?.address || "-"}
              </p>
              <p className="span-all">
                <strong>ลิงก์แผนที่:</strong> {delivery?.map_link || "-"}
              </p>
            </div>
          </section>
        )}

        <section className="print-section print-total-box">
          <div className="print-total-row">
            <span>ราคาช่อ</span>
            <strong>{formatMoney(bouquetPrice)} บาท</strong>
          </div>
          <div className="print-total-row">
            <span>ค่าจัดส่ง</span>
            <strong>{formatMoney(deliveryPrice)} บาท</strong>
          </div>
          <div className="print-total-row grand">
            <span>ยอดรวมสุทธิ</span>
            <strong>{formatMoney(grandTotal)} บาท</strong>
          </div>
        </section>

        <section className="print-section">
          <h2>ตรวจสอบก่อนส่งมอบ</h2>
          <div className="print-checks">
            <span className="print-check"><i className="print-checkbox" /> ดอกไม้ครบตามรายการ</span>
            <span className="print-check"><i className="print-checkbox" /> สีห่อและโบว์ถูกต้อง</span>
            <span className="print-check"><i className="print-checkbox" /> แนบการ์ดแล้ว</span>
            <span className="print-check"><i className="print-checkbox" /> ตรวจรูปช่อสำเร็จ</span>
            <span className="print-check"><i className="print-checkbox" /> ตรวจชื่อและเบอร์ผู้รับ</span>
            <span className="print-check"><i className="print-checkbox" /> รับเงินครบถ้วน</span>
          </div>
        </section>

        {attachments.length > 0 && (
          <section className="print-section image-section">
            <h2>รูปภาพออเดอร์</h2>
            <div className="print-images">
              {attachments.map((attachment, index) => (
                <figure
                  className="print-figure"
                  key={`${attachment.label}-${index}`}
                >
                  {attachment.src && (
                    <img
                      alt={attachment.label || "รูปภาพออเดอร์"}
                      src={attachment.src}
                    />
                  )}
                  <figcaption>
                    <strong>{attachment.label || "-"}</strong>
                    <span>{attachment.file_name || "-"}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="print-section print-signatures">
          <div className="print-signature">ผู้จัดช่อ / ผู้ตรวจสอบ</div>
          <div className="print-signature">ผู้รับสินค้า / ผู้ส่งมอบ</div>
        </section>
      </main>
    </>
  );
}
