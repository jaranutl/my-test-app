import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { signOrderAttachments } from "@/lib/orderImages.server";
import { ORDER_SELECT } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import { OrderDetailWorkspace } from "@/components/orderdetail/OrderDetailWorkspace";
import {
  handoffToGrab,
  updateOrderStatus,
  uploadDeliveredPhoto,
  uploadFinishedPhoto,
} from "../actions";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const supabase = await supabaseServer();

  const { data: order, error } = await supabase
    .from("order")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single<OrderRecord>();

  if (error || !order) {
    notFound();
  }

  const signedOrder = { ...order, attachments: await signOrderAttachments(order.attachments) };

  return (
    <OrderDetailWorkspace
      order={signedOrder}
      updateStatusAction={updateOrderStatus.bind(null, order.id)}
      handoffToGrabAction={handoffToGrab.bind(null, order.id)}
      uploadFinishedPhotoAction={uploadFinishedPhoto.bind(null, order.id)}
      uploadDeliveredPhotoAction={uploadDeliveredPhoto.bind(null, order.id)}
    />
  );
}
