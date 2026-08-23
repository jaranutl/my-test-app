export default function OrderListLoading() {
  return (
    <div className="p-4">
      <div className="mb-4 h-8 w-48 animate-pulse rounded bg-stone-200 dark:bg-white/10" />
      <div className="mb-4 h-16 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
