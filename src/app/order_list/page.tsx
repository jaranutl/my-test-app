// src/app/order_list/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { ORDER_SELECT } from "@/components/orderlist/types";
import type { OrderRecord } from "@/components/orderlist/types";
import type { OrderListSearchParams } from "@/components/orderlist/searchParams";
import { ORDER_LIST_PAGE_SIZE } from "@/components/orderlist/searchParams";
import { OrderListFilterBar } from "@/components/orderlist/OrderListFilterBar";
import { OrderListSummaryCards } from "@/components/orderlist/OrderListSummaryCards";
import { OrderListTimeline } from "@/components/orderlist/OrderListTimeline";
import { OrderListPagination } from "@/components/orderlist/OrderListPagination";
import { OrderListThemeToggle } from "@/components/orderlist/OrderListThemeToggle";
import { OrderListQuickFilters } from "@/components/orderlist/OrderListQuickFilters";

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
  const from = (page - 1) * ORDER_LIST_PAGE_SIZE;
  const to = from + ORDER_LIST_PAGE_SIZE - 1;

  const supabase = await supabaseServer();
  let query = supabase
    .from("order")
    .select(ORDER_SELECT, { count: "exact" })
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

  const { data, error, count } = await query.range(from, to).returns<OrderRecord[]>();

  const orders = data ?? [];
  const totalCount = count ?? 0;

  if (orders.length === 0 && page > 1 && totalCount > 0) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.deliveryDate) next.set("deliveryDate", params.deliveryDate);
    if (params.pickupMode) next.set("pickupMode", params.pickupMode);
    if (params.status) next.set("status", params.status);
    redirect(`/order_list?${next.toString()}`);
  }

  return (
    <div className="min-h-screen p-4 dark:bg-[#121713]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
          รายการคำสั่งซื้อ <span className="text-sm font-normal text-stone-400">({totalCount})</span>
        </h2>
        <div className="flex items-center gap-2">
          <OrderListThemeToggle />
          <Link
            href="/order_form"
            className="flex items-center gap-2 rounded-xl bg-[#dd5f83] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ca5277]"
          >
            <CirclePlus size={16} /> เพิ่มออเดอร์
          </Link>
        </div>
      </div>

      <OrderListFilterBar searchParams={params} />

      {error && <p className="mb-4 text-sm font-medium text-red-600">{error.message}</p>}

      <OrderListSummaryCards orders={orders} />

      <OrderListQuickFilters searchParams={params} />

      <OrderListTimeline orders={orders} />

      <OrderListPagination page={page} pageSize={ORDER_LIST_PAGE_SIZE} totalCount={totalCount} searchParams={params} />
    </div>
  );
}
