import Link from "next/link";
import type { OrderListSearchParams } from "./searchParams";

type OrderListPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: OrderListSearchParams;
};

const buildHref = (page: number, searchParams: OrderListSearchParams) => {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.deliveryDate) params.set("deliveryDate", searchParams.deliveryDate);
  if (searchParams.pickupMode) params.set("pickupMode", searchParams.pickupMode);
  if (searchParams.status) params.set("status", searchParams.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/order_list?${query}` : "/order_list";
};

export const OrderListPagination = ({ page, pageSize, totalCount, searchParams }: OrderListPaginationProps) => {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);

  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="text-xs text-stone-500 dark:text-stone-400">
        {from}–{to} จาก {totalCount}
      </span>
      <div className="flex gap-2">
        <Link
          href={buildHref(Math.max(1, page - 1), searchParams)}
          aria-disabled={page <= 1}
          className={`btn btn-sm btn-outline ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          ก่อนหน้า
        </Link>
        <Link
          href={buildHref(Math.min(totalPages, page + 1), searchParams)}
          aria-disabled={page >= totalPages}
          className={`btn btn-sm btn-outline ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          ถัดไป
        </Link>
      </div>
    </div>
  );
};
