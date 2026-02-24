'use client';

import Link from "next/link";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ภาพรวมคำสั่งซื้อ", href: "/dashboard" },
  { label: "รายการคำสั่งซื้อ", href: "/order_list" },
  { label: "เพิ่มรายการใหม่", href: "/order_form", Icon: AddIcon },
];

const Navbar2 = () => {
  const pathname = usePathname();

  return (
    // <header className="w-full bg-[#4cddf0]">
      <div className="mx-auto ">
        {/* outer frame */}
        <nav className="flex items-stretch justify-between border-black/20 bg-[#82ffff]">
          {/* left: logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 border-r border-black/20"
          >
            {/* โลโก้แบบ placeholder */}
            <div className="h-9 w-9 rounded-full border border-black/20 bg-white/60" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Florist</div>
            </div>
          </Link>
          {/* middle: boxed menu */}
          <div className="flex flex-1 items-stretch justify-end">
            <ul className="flex items-stretch divide-x divide-black/20">
              {navItems.map((item) => (
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    className={`flex items-center px-6 text-[14px] font-semibold tracking-wider ${
                    pathname === item.href
                      ? "bg-white/40 text-black border-b-2 border-black"
                      : "text-black/80"
                  }`}
                    
                  >
                    {item.Icon && <item.Icon className="mr-2 text-sm" />}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    // </header>
  )
}

export default Navbar2