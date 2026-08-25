// src/app/order_list/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { signOrderAttachments, signOrderRecords } from "@/lib/orderImages.server";
import { ORDER_LIST_SELECT, ORDER_SELECT } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import type { OrderListSearchParams } from "@/components/orderlist/searchParams";
import { ORDER_LIST_PAGE_SIZE } from "@/components/orderlist/searchParams";
import { OrderListFilterBar } from "@/components/orderlist/OrderListFilterBar";
import { OrderListSummaryCards } from "@/components/orderlist/OrderListSummaryCards";
import { OrderListTimeline } from "@/components/orderlist/OrderListTimeline";
import { OrderListPagination } from "@/components/orderlist/OrderListPagination";
import { OrderListThemeToggle } from "@/components/orderlist/OrderListThemeToggle";
import { OrderListQuickFilters } from "@/components/orderlist/OrderListQuickFilters";
import { OrderListDetailPanel } from "@/components/orderlist/OrderListDetailPanel";

type OrderListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const asString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// PostgREST's .or() filter string breaks on unescaped commas/parens; ilike
// patterns treat % and _ as wildcards. Strip/escape both before interpolating
// user input into the query.
const sanitizeForOrFilter = (value: string) =>
  value.replace(/[,()]/g, "").replace(/[%_\\]/g, (match) => `\\${match}`);

export default async function OrderListPage({ searchParams }: OrderListPageProps) {
  const rawParams = await searchParams;
  const params: OrderListSearchParams = {
    q: asString(rawParams.q),
    deliveryDate: asString(rawParams.deliveryDate),
    pickupMode: asString(rawParams.pickupMode),
    status: asString(rawParams.status),
    page: asString(rawParams.page),
  };

  const page = Math.max(1, Number(params.page) || 1);
  const selectedId = Number(asString(rawParams.orderId));
  const from = (page - 1) * ORDER_LIST_PAGE_SIZE;
  const to = from + ORDER_LIST_PAGE_SIZE - 1;

  const supabase = await supabaseServer();
  let query = supabase
    .from("order")
    .select(ORDER_LIST_SELECT, { count: "exact" })
    .order("delivery_date", { ascending: false, nullsFirst: false })
    .order("delivery_time", { ascending: true, nullsFirst: false })
    .order("order_no", { ascending: false });

  const trimmedQuery = params.q?.trim();
  if (trimmedQuery) {
    // Order numbers are short (shop volume won't reach 7 digits) and never
    // start with 0; Thai mobile numbers always do, so a leading zero routes
    // to the name/phone search below instead of an order_no lookup.
    if (/^[1-9]\d{0,5}$/.test(trimmedQuery)) {
      query = query.eq("order_no", Number(trimmedQuery));
    } else {
      const safeQuery = sanitizeForOrFilter(trimmedQuery);
      query = query.or(`line_name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`, {
        foreignTable: "customer",
      });
    }
  }

  if (params.deliveryDate) {
    query = query.eq("delivery_date", params.deliveryDate);
  }

  if (params.pickupMode && params.pickupMode !== "all") {
    query = query.eq("pickup_mode", params.pickupMode);
  }

  if (params.status === "not_delivered") {
    query = query.neq("status", "delivered");
  } else if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const selectedQuery =
    Number.isInteger(selectedId) && selectedId > 0
      ? supabase.from("order").select(ORDER_SELECT).eq("id", selectedId).maybeSingle<OrderRecord>()
      : Promise.resolve({ data: null, error: null });

  // These two queries are independent — fire them together instead of
  // awaiting sequentially, which was paying two full network round trips
  // to the remote Supabase project on every detail-panel view.
  const [{ data, error, count }, selectedResult] = await Promise.all([
    query.range(from, to).returns<OrderRecord[]>(),
    selectedQuery,
  ]);

  const [orders, selectedAttachments] = await Promise.all([
    signOrderRecords(data ?? []),
    selectedResult.data ? signOrderAttachments(selectedResult.data.attachments) : Promise.resolve(null),
  ]);
  const totalCount = count ?? 0;
  const selectedOrder = selectedResult.data ? { ...selectedResult.data, attachments: selectedAttachments } : null;

  if (orders.length === 0 && page > 1 && totalCount > 0) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.deliveryDate) next.set("deliveryDate", params.deliveryDate);
    if (params.pickupMode) next.set("pickupMode", params.pickupMode);
    if (params.status) next.set("status", params.status);
    redirect(`/order_list?${next.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-24 dark:bg-[#161d18] md:pb-8">
      <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#202a23] lg:px-9">
        <div>
          <p className="text-xs text-stone-400">คำสั่งซื้อ / ทั้งหมด</p>
          <h1 className="font-semibold text-stone-800 dark:text-stone-100">
            รายการคำสั่งซื้อ <span className="text-sm font-normal text-stone-400">({totalCount})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <OrderListThemeToggle />
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 lg:p-8">

      <OrderListFilterBar key={params.q ?? ""} searchParams={params} />

      {error && <p className="mb-4 text-sm font-medium text-red-600">{error.message}</p>}

      <OrderListSummaryCards orders={orders} />

      <OrderListQuickFilters searchParams={params} />

      <OrderListTimeline orders={orders} />

      <OrderListPagination page={page} pageSize={ORDER_LIST_PAGE_SIZE} totalCount={totalCount} searchParams={params} />
      </main>

      {selectedOrder && <OrderListDetailPanel order={selectedOrder} />}
    </div>
  );
}
