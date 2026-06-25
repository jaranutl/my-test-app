import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { AutoPrint } from "./AutoPrint";

type PrintOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type OrderItem = {
  lineNo?: number;
  flowerType?: string;
  flowerColor?: string;
  quantity?: number;
};

type Customer = {
  line_name?: string | null;
  phone?: string | null;
};

type DeliveryInfo = {
  recipient_name?: string | null;
  recipient_phone?: string | null;
  address?: string | null;
  map_link?: string | null;
  delivery_price?: number | string | null;
};

type Attachment = {
  label?: string | null;
  file_name?: string | null;
  src?: string | null;
};

type PrintableOrder = {
  id: number | string;
  order_no: number | string | null;
  items: OrderItem[] | null;
  pickup_mode: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  paper_color: string | null;
  bow_color: string | null;
  bouquet_price: number | string | null;
  has_card: boolean | null;
  card_message: string | null;
  created_at: string | null;
  customer: Customer | null;
  delivery_info: DeliveryInfo[] | DeliveryInfo | null;
  attachments: Attachment[] | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

const getDeliveryInfo = (value: PrintableOrder["delivery_info"]) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
};

export default async function PrintOrderPage({
  params,
}: PrintOrderPageProps) {
  const { orderId } = await params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("order")
    .select(
      `
        id,
        order_no,
        items,
        pickup_mode,
        delivery_date,
        delivery_time,
        paper_color,
        bow_color,
        bouquet_price,
        has_card,
        card_message,
        created_at,
        customer:customer_id (
          line_name,
          phone
        ),
        delivery_info (
          recipient_name,
          recipient_phone,
          address,
          map_link,
          delivery_price
        ),
        attachments (
          label,
          file_name,
          src
        )
      `,
    )
    .eq("id", orderId)
    .single<PrintableOrder>();

  if (error || !data) {
    notFound();
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const delivery = getDeliveryInfo(data.delivery_info);
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  const isDelivery = data.pickup_mode === "delivery";

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

        .print-section {
          break-inside: avoid;
        }

        .print-section h2 {
          border-bottom: 1px solid #d1d5db;
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
          background: #f3f4f6;
        }

        .print-note {
          border: 1px solid #d1d5db;
          max-height: 72px;
          min-height: 42px;
          overflow: hidden;
          padding: 6px;
          white-space: pre-wrap;
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
          min-height: 86mm;
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
        <h1 className="print-title">ใบออเดอร์</h1>

        <section className="print-grid print-section">
          <p>
            <strong>เลขที่คำสั่งซื้อ:</strong> {data.order_no ?? "-"}
          </p>
          <p>
            <strong>วันที่บันทึก:</strong> {formatDate(data.created_at)}
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
      </main>
    </>
  );
}
