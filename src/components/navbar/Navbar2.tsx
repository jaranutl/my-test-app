import React from 'react'
import Link from "next/link";

const navItems = [
  { label: "ภาพรวมคำสั่งซื้อ", href: "/menu" },
  { label: "รายการคำสั่งซื้อ", href: "/special-order" },
  { label: "เพิ่มรายการใหม่", href: "/order_form" },
];

const Navbar2 = () => {
  return (
    // <header className="w-full bg-[#4cddf0]">
      <div className="mx-auto ">
        {/* outer frame */}
        <nav className="flex items-stretch justify-between border border-black/20 bg-[#82ffff]">
          {/* left: logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 border-r border-black/20"
          >
            {/* โลโก้แบบ placeholder */}
            <div className="h-9 w-9 rounded-full border border-black/20 bg-white/60" />
            <div className="leading-tight">
              <div className="text-xs font-semibold tracking-wide">ถั่ว</div>
              <div className="text-xs font-semibold tracking-wide">หวาน</div>
            </div>
          </Link>

          {/* middle: boxed menu */}
          <div className="flex flex-1 items-stretch justify-center">
            <ul className="flex items-stretch divide-x divide-black/20">
              {navItems.map((item) => (
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    className="flex items-center px-6 text-[12px] font-semibold tracking-wider text-black/80 hover:bg-black/5 transition"
                  >
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