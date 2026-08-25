import type { OrderStatus } from "@/lib/orderStatus";
import type { PickupMode } from "@/components/formorder/types";

export type OrderItem = {
  lineNo?: number;
  flowerType?: string;
  flowerColor?: string;
  quantity?: number;
};

export type CustomerRecord = {
  id?: number;
  line_name: string | null;
  phone: string | null;
  note: string | null;
};

export type DeliveryInfoRecord = {
  id?: number;
  recipient_name: string | null;
  recipient_phone: string | null;
  address: string | null;
  map_link: string | null;
  delivery_price: number | string | null;
};

export type AttachmentRecord = {
  id?: number;
  label: string | null;
  file_name: string | null;
  src: string | null;
  storage_path?: string | null;
  thumbnail_path?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  uploader?: string | null;
  created_at?: string | null;
  full_url?: string | null;
  thumbnail_url?: string | null;
};

export type OrderRecord = {
  id: number;
  order_no: number | null;
  customer_id: number | null;
  status: OrderStatus;
  items: OrderItem[] | null;
  pickup_mode: PickupMode | null;
  delivery_date: string | null;
  delivery_time: string | null;
  paper_color: string | null;
  bow_color: string | null;
  bouquet_price: number | string | null;
  has_card: boolean | null;
  card_message: string | null;
  created_at: string;
  grab_handoff_at: string | null;
  delivered_at: string | null;
  customer: CustomerRecord | null;
  delivery_info: DeliveryInfoRecord[] | DeliveryInfoRecord | null;
  attachments: AttachmentRecord[] | null;
};

export const ORDER_SELECT = `
  id,
  order_no,
  customer_id,
  status,
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
  grab_handoff_at,
  delivered_at,
  customer:customer_id!inner (
    id,
    line_name,
    phone,
    note
  ),
  delivery_info (
    id,
    recipient_name,
    recipient_phone,
    address,
    map_link,
    delivery_price
  ),
  attachments (*)
`;

export const ORDER_LIST_SELECT = `
  id,
  order_no,
  customer_id,
  status,
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
  grab_handoff_at,
  delivered_at,
  customer:customer_id!inner (id, line_name, phone, note),
  delivery_info (id, recipient_name, recipient_phone, address, map_link, delivery_price)
`;

export const getDeliveryInfo = (
  value: OrderRecord["delivery_info"],
): DeliveryInfoRecord | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
};

export const getOrderTotal = (order: OrderRecord) => {
  const delivery = getDeliveryInfo(order.delivery_info);
  const bouquet = Number(order.bouquet_price ?? 0);
  const deliveryFee = order.pickup_mode === "delivery" ? Number(delivery?.delivery_price ?? 0) : 0;
  return { bouquet, deliveryFee, total: bouquet + deliveryFee };
};

export const ATTACHMENT_LABELS = {
  reference: "รูปตัวอย่าง",
  finished: "รูปช่อที่จัดเสร็จแล้ว",
  delivered: "รูปส่งมอบ",
} as const;

export const findAttachment = (
  attachments: AttachmentRecord[] | null | undefined,
  label: string,
) => attachments?.find((attachment) => attachment.label === label) ?? null;

export type SortKey = "order_no" | "delivery_date" | "bouquet_price" | "status";
