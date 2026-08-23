"use client";

export default function OrderListError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="mb-3">โหลดรายการคำสั่งซื้อไม่สำเร็จ</p>
        <button type="button" onClick={reset} className="btn btn-sm btn-outline">
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
