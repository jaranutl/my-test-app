"use client";

import { OrderFormWizard } from "@/components/formorder/OrderFormWizard";
import { FileText, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderForm() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className={`order-form-theme min-h-screen pb-24 md:pb-8 ${isDark ? "dark bg-[#121713] text-stone-100" : "bg-[#faf9f7] text-stone-800"}`}>
      <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#1a211c]">
        <div>
          <p className="text-xs text-stone-400">คำสั่งซื้อ / สร้างใหม่</p>
          <h1 className="text-lg font-semibold">สร้างคำสั่งซื้อใหม่</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-500 dark:bg-white/8 dark:text-stone-300 sm:flex">
            <FileText size={14} /> เลขที่สร้างอัตโนมัติเมื่อบันทึก
          </span>
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/8 dark:text-amber-300 dark:hover:bg-white/12"
            aria-label={isDark ? "ทดลองธีมสว่าง" : "ทดลองธีมมืด"}
            title={isDark ? "เปลี่ยนเป็น Light theme" : "เปลี่ยนเป็น Dark theme"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="p-4 lg:p-8">
        <OrderFormWizard
          onPrintOrder={(orderId) => {
            if (!orderId) return;
            window.open(`/order_print/${orderId}`, "_blank");
          }}
        />
      </div>
    </div>
  );
}
