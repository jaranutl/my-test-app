import React from 'react'

export const Formorder = () => {
  return (
    <div className="p-4">
      <div className='mb-4 flex items-center'>
        <h2 className="flex-1 text-2xl font-bold text-center">สร้างคำสั่งซื้อใหม่</h2>
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">เลขที่คำสั่งซื้อ</label>
          <input type="text" id="order" name="order" className="mt-1 block w-auto border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>
        <div className="mt-4 flex space-x-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อ LINE ลูกค้า</label>
            <input type="text" id="name" name="name" className="mt-1 block w-auto border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="กรอกชื่อ LINE ลูกค้า" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input type="tel" id="phone" name="phone" className="mt-1 block w-auto border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="กรอกเบอร์โทรศัพท์" />
          </div>
        </div>
    </div>
  )
}
