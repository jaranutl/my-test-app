"use client";

import Image from "next/image";
import Link from "next/link";
import { CirclePlus, LayoutDashboard, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ภาพรวม", mobileLabel: "ภาพรวม", href: "/dashboard", icon: LayoutDashboard },
  { label: "รายการคำสั่งซื้อ", mobileLabel: "รายการ", href: "/order_list", icon: ShoppingBag },
  { label: "เพิ่มรายการใหม่", mobileLabel: "เพิ่มใหม่", href: "/order_form", icon: CirclePlus },
];

const Navbar2 = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/prototype") || /^\/order_list\/\d+$/.test(pathname)) return null;

  return (
    <>
      <aside className="hidden min-h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-4 text-stone-700 dark:border-white/10 dark:bg-[#17211b] dark:text-white md:flex">
        <Link href="/dashboard" className="flex h-16 items-center gap-3 px-2">
          <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-rose-100 dark:bg-[#f7eee9]">
            <Image src="/SweetPea&Co_logo.png" alt="Sweet Pea & Co. logo" width={40} height={40} priority className="size-full object-contain" />
          </span>
          <span>
            <span className="block font-semibold leading-none">Sweet Pea & Co.</span>
            <span className="mt-1 block text-[11px] text-stone-400 dark:text-white/50">flower studio</span>
          </span>
        </Link>

        <nav className="mt-4 flex w-full flex-col gap-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active ? "bg-rose-50 text-[#d34f77] dark:bg-[#f3c95f] dark:text-[#17211b]" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"}`}>
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mb-5 mt-auto grid size-9 place-items-center rounded-full bg-[#f7d9df] text-xs font-semibold text-[#b44767]">SP</div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid h-17 grid-cols-3 border-t border-stone-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] text-stone-500 dark:border-white/10 dark:bg-[#17211b] dark:text-white md:hidden">
        {navItems.map(({ mobileLabel, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-1 text-[10px] ${active ? "text-[#d34f77] dark:text-[#f3c95f]" : ""}`}>
              <Icon size={20} />
              <span>{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar2;
