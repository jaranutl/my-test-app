import { getStatusStep } from "@/lib/orderStatus";
import type { OrderRecord, SortKey } from "./types";
import type { OrderListSearchParams } from "./OrderFilterForm";

type OrderListTableProps = {
  orders: OrderRecord[];
  searchParams: OrderListSearchParams;
};

const SORT_LABELS: Record<SortKey, string> = {
  order_no: "เลขที่",
  delivery_date: "วันที่/เวลารับช่อ",
  bouquet_price: "ราคา",
  status: "สถานะ",
};

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0";
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toString() : String(value);
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(new Date(value));
};

const buildSortHref = (column: SortKey, searchParams: OrderListSearchParams) => {
  const params = new URLSearchParams();
  if (searchParams.orderNo) params.set("orderNo", searchParams.orderNo);
  if (searchParams.customerName) params.set("customerName", searchParams.customerName);
  if (searchParams.deliveryDate) params.set("deliveryDate", searchParams.deliveryDate);
  if (searchParams.pickupMode) params.set("pickupMode", searchParams.pickupMode);
  if (searchParams.status) params.set("status", searchParams.status);

  const isSameColumn = searchParams.sort === column;
  const nextDir = isSameColumn && searchParams.dir === "asc" ? "desc" : "asc";
  params.set("sort", column);
  params.set("dir", nextDir);

  return `/order_list?${params.toString()}`;
};

const sortIndicator = (column: SortKey, searchParams: OrderListSearchParams) => {
  if (searchParams.sort !== column) return "";
  return searchParams.dir === "desc" ? " ▼" : " ▲";
};

const SortableHeader = ({
  column,
  searchParams,
}: {
  column: SortKey;
  searchParams: OrderListSearchParams;
}) => (
  <th>
    <a href={buildSortHref(column, searchParams)} className="cursor-pointer select-none">
      {SORT_LABELS[column]}
      {sortIndicator(column, searchParams)}
    </a>
  </th>
);

export const OrderListTable = ({ orders, searchParams }: OrderListTableProps) => {
  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table w-full">
        <thead>
          <tr>
            <SortableHeader column="order_no" searchParams={searchParams} />
            <th>ลูกค้า</th>
            <SortableHeader column="delivery_date" searchParams={searchParams} />
            <th>รูปแบบ</th>
            <SortableHeader column="bouquet_price" searchParams={searchParams} />
            <SortableHeader column="status" searchParams={searchParams} />
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const step = getStatusStep(order.status);

            return (
              <tr key={order.id} className="hover:bg-gray-100">
                <td className="font-semibold">
                  <a href={`/order_list/${order.id}`}>#{order.order_no ?? order.id}</a>
                </td>
                <td>
                  <div>{order.customer?.line_name || "-"}</div>
                  <div className="text-xs text-gray-500">{order.customer?.phone || ""}</div>
                </td>
                <td>
                  <div>{formatDate(order.delivery_date)}</div>
                  <div className="text-xs text-gray-500">{order.delivery_time || ""}</div>
                </td>
                <td>{order.pickup_mode === "delivery" ? "จัดส่ง" : "รับที่ร้าน"}</td>
                <td>{formatMoney(order.bouquet_price)} บาท</td>
                <td>
                  {step && (
                    <span className={`badge ${step.badgeClass} text-white`}>{step.label}</span>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/order_list/${order.id}`}
                      className="btn btn-sm btn-soft btn-neutral"
                    >
                      ดูรายละเอียด
                    </a>
                    <a
                      href={`/order_print/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-soft btn-secondary"
                    >
                      พิมพ์
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}

          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-sm text-gray-500">
                ไม่พบออเดอร์ตามเงื่อนไขที่เลือก
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
