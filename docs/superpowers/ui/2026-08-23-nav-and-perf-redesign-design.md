# Sidebar Navigation and Performance Redesign

## Problem

The app has three operational surfaces — dashboard (ภาพรวมคำสั่งซื้อ), order list (รายการคำสั่งซื้อ), order form (เพิ่มรายการใหม่) — but no shared navigation shell, and both `order_list` and `dashboard` fetch the entire `order` table on every page load with no pagination or server-side filtering, then filter/sort in JavaScript. This makes the app slow and hard to navigate, especially as order volume grows.

## Scope

- Add a persistent sidebar navigation shell shared across all three pages.
- Fix the root cause of slow loads: move filtering, sorting, and pagination from client-side JS (after a full-table fetch) to the Supabase query itself.
- Minor: wrap `order_form` in the new shell only — no changes to its internal logic.

Out of scope: client-side caching (SWR/React Query), Supabase realtime subscriptions, full UI redesign of existing components. These may be revisited later if pagination/server-side filtering alone isn't enough.

## Navigation / Layout

- New shared layout shell (`src/components/layout/AppShell.tsx`, client component) wraps the app in `src/app/layout.tsx`.
- Desktop (`md` breakpoint and up): persistent icon-only sidebar, 56px wide, left side. Hover shows a tooltip label per item.
- Mobile (below `md`): bottom nav bar with icon + short label, fixed to viewport bottom.
- Three nav items, in order: ภาพรวม → `/dashboard`, รายการคำสั่งซื้อ → `/order_list`, เพิ่มรายการใหม่ → `/order_form`.
- Active route highlighted via `usePathname()`.
- New component `src/components/layout/SidebarNav.tsx` holds the nav item list and active-state logic, shared by both desktop sidebar and mobile bottom-nav rendering paths.

## Performance fix — order_list

- Move all filters (`orderNo`, `deliveryDate`, `pickupMode`, `status`) into the Supabase query using `.eq()` / `.ilike()`, instead of filtering the full fetched array in JS.
- `customerName` filter stays client-side, applied to the already-paginated page of results. (Filtering on a joined table's text column server-side is a Supabase edge case not worth solving for this dataset size; scoping via pagination already bounds the per-page cost.)
- Add pagination via `.range(offset, offset + pageSize - 1)`, page size 25, newest (`order_no desc`) first.
- No default date/status filter — default view is "all orders," paginated. (Confirmed with user: order volume doesn't yet justify forcing a default date scope here.)
- Sorting (`order_no`, `delivery_date`, `bouquet_price`, `status`) stays server-side via `.order()`.
- Pagination edge case: if a requested page number exceeds available data, redirect to page 1.

## Performance fix — dashboard

- Wire the existing `DateRangeFilter` component's value into the Supabase query (`.gte("created_at", start).lte("created_at", end)`) instead of fetching all orders and filtering client-side.
- Default range: today.

## order_form

- No logic changes. Wrapped by the new `AppShell` like the other two pages.

## Theme (light/dark)

Bug found: dark-mode CSS overrides in `globals.css` are currently scoped to `.order-form-theme.dark` only. Outside that scope (e.g. dashboard's Mantine `DatePickerInput` popover), components pick up inconsistent/dark styling with no matching override, producing unreadable black-background fields.

- Add a theme toggle control to the sidebar (`AppShell`), switching an `html.dark` class app-wide (existing `@custom-variant dark (&:is(.dark *))` convention).
- Expand the existing scoped dark overrides in `globals.css` from `.order-form-theme.dark` to apply globally under `.dark`, covering Mantine components (`.mantine-Popover-dropdown`, `DatePickerInput`), daisyUI inputs/selects, and shadcn `[data-slot="select-*"]` elements consistently across all three pages.
- Default theme: light. Persist user choice in `localStorage`; no Supabase persistence needed.

## Error handling

- Supabase query errors surface via the existing sweetalert2-based toast/alert pattern already used elsewhere in the app, instead of raw inline error text.
- Invalid/out-of-range pagination requests redirect to page 1 rather than showing an empty state.

## Testing / validation

- `npx tsc --noEmit --pretty false`
- `git diff --check`
- Manual check: order_list pagination (page 2+), each filter field individually, dashboard date-range switching, sidebar responsive behavior (desktop icon sidebar vs mobile bottom nav), order_form save + print flow still works end-to-end, theme toggle on all three pages (verify Mantine date picker popover no longer black/unreadable in both light and dark).
