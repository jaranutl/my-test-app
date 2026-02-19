import React from 'react'
import Logo from './Logo'
import AddIcon from '@mui/icons-material/Add';

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-sm">
  <div className="navbar-start">
    {/* onhover logo to show full name of the company */}
    <a className="btn btn-ghost text-xl"><Logo/></a>
  </div>
  <div className="navbar-center hidden lg:flex">
    <ul className="menu menu-horizontal px-1 gap-5">
      <li><a>ภาพรวมคำสั่งซื้อ</a></li>
      <li><a>รายการคำสั่งซื้อ</a></li>
    </ul>
  </div>
  <div className="navbar-end">
    <a className="btn"><AddIcon className="mr-2" /> เพิ่มคำสั่งซื้อ</a>
  </div>
</div>
    )
}

export default Navbar
