"use client";

import { OrderFormWizard } from "@/components/formorder/OrderFormWizard";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderForm() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className={`order-form-theme relative min-h-screen pb-24 md:pb-8 ${isDark ? "dark bg-[#161d18] text-stone-100" : "bg-[#faf9f7] text-stone-800"}`}>
      <button
        type="button"
        onClick={() => setIsDark((current) => !current)}
        className="fixed right-5 top-5 z-40 grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 dark:border-white/10 dark:bg-[#202a23] dark:text-amber-300"
        aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
        title={isDark ? "Light theme" : "Dark theme"}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <main className="p-5 lg:py-8">
        <OrderFormWizard
          onPrintOrder={(orderId) => {
            if (!orderId) return;
            window.open(`/order_print/${orderId}`, "_blank");
          }}
        />
      </main>
    </div>
  );
}
