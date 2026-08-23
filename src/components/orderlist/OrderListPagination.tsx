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

// At most 5 page-number buttons, centered on the current page where possible.
const visiblePages = (page: number, totalPages: number) => {
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
};

export const OrderListPagination = ({ page, pageSize, totalCount, searchParams }: OrderListPaginationProps) => {
  if (totalCount === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);
  const pages = visiblePages(page, totalPages);

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
      <span>
        แสดง {from}–{to} จาก {totalCount} รายการ
      </span>
      <div className="flex gap-1">
        <Link
          href={buildHref(Math.max(1, page - 1), searchParams)}
          aria-disabled={page <= 1}
          className={`rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 ${
            page <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          ก่อนหน้า
        </Link>
        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p, searchParams)}
            className={
              p === page
                ? "rounded-lg bg-stone-900 px-3 py-2 text-white dark:bg-white dark:text-stone-900"
                : "rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
            }
          >
            {p}
          </Link>
        ))}
        <Link
          href={buildHref(Math.min(totalPages, page + 1), searchParams)}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 ${
            page >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
        >
          ถัดไป
        </Link>
      </div>
    </div>
  );
};
