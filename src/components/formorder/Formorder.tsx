"use client";

import React, { useState } from "react";
import { Formflower } from "./Formflower";

export const Formorder = () => {
  const [lineName, setLineName] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");

  const formatThaiPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <h2 className="flex-1 text-2xl font-bold text-center">
          สร้างคำสั่งซื้อใหม่
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            เลขที่คำสั่งซื้อ
          </label>
          <input
            type="text"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            className="mt-1 input input-bordered w-auto"
          />
        </div>
      </div>

      <div className="mt-4 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ชื่อ LINE ลูกค้า
          </label>
          <input
            type="text"
            value={lineName}
            onChange={(e) => setLineName(e.target.value)}
            className="mt-1 input input-bordered w-auto"
            placeholder="กรอกชื่อ LINE ลูกค้า"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            เบอร์โทรศัพท์
          </label>

          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) =>
              setPhone(formatThaiPhone(e.target.value))
            }
            placeholder="xxx-xxx-xxxx"
            className="mt-1 input input-bordered w-full max-w-xs"
          />
        </div>
      </div>

      <div className="mt-4">
        <Formflower />
      </div>
    </div>
  );
};