import React from 'react'
import {DatePicker} from "@heroui/date-picker";

export const Formflower = () => {
    return (
        <div className="flex w-full gap-4 border-2 border-gray-300 rounded-md p-4">
            <div className="card grid h-auto grow place-items-center">
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th></th>
                                <th>ชนิดดอกไม้</th>
                                <th>สี</th>
                                <th>จำนวน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* row 1 */}
                            <tr className="hover:bg-gray-100">
                                <th>1</th>
                                <td><input type="text" className="input input-bordered w-full max-w-xs" placeholder="ชนิดดอกไม้" /></td>
                                <td><input type="text" className="input input-bordered w-full max-w-xs" placeholder="สีดอกไม้" /></td>
                                <td><input type="number" min={0} step={1} className="input input-bordered w-full max-w-xs" placeholder="จำนวน" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    เพิ่มแถว
                </button>
            </div>
            <div className="card grid h-auto grow">
                <div className="  gap-2 mb-4">
                    <label htmlFor="note" className="block text-md font-medium text-gray-700">เขียนการ์ดอวยพร</label>
                    <textarea id="note" name="note" rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 lg:text-md" placeholder="กรอกข้อความสำหรับการ์ดอวยพร"></textarea>
                    <span className="label text-sm">*ไม่บังคับ</span>
                </div>
                <div className=' gap-2 mb-4'>
                    <label htmlFor="note" className=" block text-sm font-medium text-gray-700">สีกระดาษห่อ</label>
                    <select defaultValue="Pick a color" className="select">
                        <option disabled={true}>กรุณาเลือกสี</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
                <div className=' gap-2 mb-4'>
                    <label htmlFor="note" className=" block text-sm font-medium text-gray-700">สีโบว์</label>
                    <select defaultValue="Pick a color" className="select">
                        <option disabled={true}>กรุณาเลือกสี</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
                <div className=' gap-2 mb-4'>
                    <label htmlFor="note" className=" block text-sm font-medium text-gray-700">ราคาช่อ</label>
                    <input type="number" min={0} className="input input-bordered w-full max-w-xs" placeholder="กรอกจำนวนเงิน (บาท)" />
                </div>
                <div className='flex items-center gap-8 mb-4'>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="radio" value={"workin"} name="pickup" className="radio radio-primary radio-md" defaultChecked />
                        <span className="ml-2 text-md">รับช่อที่ร้าน</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="radio" value={"delivery"} name="pickup" className="radio radio-primary radio-md" />
                        <span className="ml-2 text-md">ให้จัดส่ง</span>
                    </label>
                </div>
                <div className='flex items-center gap-8 mb-4'>
                    <div className=' gap-2 mb-4'>
                        <DatePicker className="max-w-71" label="วันที่รับช่อ" />
                    </div>
                    <div className=' gap-2 mb-4'>
                        <label htmlFor="note" className=" block text-sm font-medium text-gray-700">เวลาที่รับช่อ</label>
                        <input type="time" className="input input-bordered w-full max-w-xs" />
                    </div>
                </div>
            </div>
        </div>
    )
}
