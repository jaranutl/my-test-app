"use client";

import React, { useState, ChangeEvent } from "react";
import { DatePickerInput } from "@mantine/dates";
import { Autocomplete } from "@mantine/core";
import "@mantine/dates/styles.css";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { CheckBox } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

dayjs.locale("th");

export const Formflower = () => {
  const [pickupMode, setPickupMode] = useState<"workin" | "delivery">("workin");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setIsVisible(e.target.checked);
  };

  type Row = {
    id: string;
    type: string;
    color: string;
    quantity: number;
  };

  const [rows, setRows] = useState<Row[]>([
    { id: uuidv4(), type: "", color: "", quantity: 1 },
  ]);

  const MAX_ROWS = 4;

  const [warning, setWarning] = useState<string | null>(null);

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: "",
        color: "",
        quantity: 1,
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleChange = <K extends keyof Row>(
    id: string,
    field: K,
    value: Row[K],
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const isRowValid = (row: Row) => {
    return (
      row.type.trim() !== "" && row.color.trim() !== "" && row.quantity >= 1
    );
  };

  const lastRow = rows[rows.length - 1];
  const canAdd = isRowValid(lastRow) && rows.length < MAX_ROWS;

  return (
    <div className="flex w-full gap-4 border-2 border-gray-300 rounded-md p-4">
      {/* LEFT: table */}
      <div className="card h-auto grow flex flex-col items-center">
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>ชนิดดอกไม้</th>
                <th>สี</th>
                <th>จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  <th>{index + 1}</th>

                  {/* ชนิดดอกไม้ */}
                  <td>
                    <Autocomplete
                      placeholder="เลือกหรือพิมพ์ชนิดดอกไม้"
                      data={["กุหลาบ", "ทานตะวัน", "ลิลลี่", "ไฮเดรนเยีย"]}
                      value={row.type}
                      onChange={(value) => handleChange(row.id, "type", value)}
                    />
                  </td>

                  {/* สี */}
                  <td>
                    <Autocomplete
                      placeholder="เลือกหรือพิมพ์สีดอกไม้"
                      data={["แดง", "ขาว", "ชมพู", "เหลือง"]}
                      value={row.color}
                      onChange={(value) => handleChange(row.id, "color", value)}
                    />
                  </td>

                  {/* จำนวน + ปุ่มลบ */}
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="input input-bordered w-24"
                        value={row.quantity}
                        onChange={(e) =>
                          handleChange(
                            row.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 1}
                        className={`btn btn-sm ${
                          rows.length <= 1
                            ? "btn-disabled"
                            : "btn-error text-white"
                        }`}
                      >
                        -
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full flex justify-end mt-3">
          <button
            type="button"
            onClick={addRow}
            disabled={!canAdd}
            className={`mt-3 btn btn-sm ${
              !canAdd ? "btn-disabled" : "btn-primary text-white"
            }`}
          >
            + เพิ่มชนิดดอกไม้
          </button>
        </div>
        {/* Card message */}
        <div className="flex flex-col gap-2 mb-4 w-full mt-3">
          <div className="flex flex-row gap-2 items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-md"
              onChange={handleToggle}
            />
            <label className="text-md font-medium text-gray-700">
              เขียนการ์ดอวยพร
            </label>
            <span className="text-sm text-gray-500">*ไม่บังคับ</span>
          </div>

          {isVisible && (
            <textarea
              rows={4}
              className="textarea textarea-bordered w-full"
              placeholder="กรอกข้อความสำหรับการ์ดอวยพร"
            />
          )}
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="card h-auto grow flex flex-col gap-3">
        <div className="flex flex-col">
          {/* Paper color */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              สีกระดาษห่อ
            </label>
            <select
              defaultValue=""
              className="select select-bordered w-full max-w-xs"
            >
              <option value="" disabled>
                กรุณาเลือกสี
              </option>
              <option value="crimson">Crimson</option>
              <option value="amber">Amber</option>
              <option value="velvet">Velvet</option>
            </select>
          </div>

          {/* Bow color */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              สีโบว์
            </label>
            <select
              defaultValue=""
              className="select select-bordered w-full max-w-xs"
            >
              <option value="" disabled>
                กรุณาเลือกสี
              </option>
              <option value="crimson">Crimson</option>
              <option value="amber">Amber</option>
              <option value="velvet">Velvet</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              ราคาช่อ
            </label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full max-w-xs"
              placeholder="กรอกจำนวนเงิน (บาท)"
            />
          </div>

          {/* Pickup mode
          <div className="flex items-center gap-8 mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="workin"
                name="pickup"
                className="radio radio-primary radio-md"
                checked={pickupMode === "workin"}
                onChange={() => setPickupMode("workin")}
              />
              <span className="ml-2 text-md">รับช่อที่ร้าน</span>
            </label>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="delivery"
                name="pickup"
                className="radio radio-primary radio-md"
                checked={pickupMode === "delivery"}
                onChange={() => setPickupMode("delivery")}
              />
              <span className="ml-2 text-md">ให้จัดส่ง</span>
            </label>
          </div> */}

          {/* Date + Time */}
          <div className="flex flex-wrap items-end gap-6 mb-4">
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <DatePickerInput
                clearable
                label="วันที่รับช่อ"
                placeholder="เลือกวันที่"
                value={deliveryDate}
                onChange={setDeliveryDate}
                locale="th"
                // minDate={new Date()}
                withWeekNumbers={false}
                dropdownType="popover"
                firstDayOfWeek={1} // จันทร์เป็นวันแรก (เหมาะกับไทย)
                // ✅ กัน DaisyUI/Tailwind ชน + บังคับ grid ของ calendar ให้สวย
                styles={{
                  monthCell: { padding: 2 },
                  day: {
                    width: 36,
                    height: 36,
                    lineHeight: "36px",
                    fontSize: "14px",
                  },
                  weekday: {
                    width: 36,
                    height: 28,
                    lineHeight: "28px",
                    fontSize: "13px",
                  },
                }}
                // ✅ แนะนำให้กำหนดขนาด input ให้คงที่
                size="md"
                radius="md"
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <label className="block text-sm font-medium text-gray-700">
                เวลาที่รับช่อ
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>
          {/* Pickup mode */}
          <div className="flex items-center gap-8 mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="workin"
                name="pickup"
                className="radio radio-primary radio-md"
                checked={pickupMode === "workin"}
                onChange={() => setPickupMode("workin")}
              />
              <span className="ml-2 text-md">รับช่อที่ร้าน</span>
            </label>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                value="delivery"
                name="pickup"
                className="radio radio-primary radio-md"
                checked={pickupMode === "delivery"}
                onChange={() => setPickupMode("delivery")}
              />
              <span className="ml-2 text-md">ให้จัดส่ง</span>
            </label>
          </div>
        </div>

        {/* ✅ ย้ายข้อมูลจัดส่งมาด้านล่าง radio */}
        {pickupMode === "delivery" && (
          <div className="w-full">
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                ข้อมูลจัดส่ง
              </div>

              {/* ให้เริ่มชิดซ้ายตรงกับตาราง */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อผู้รับ
                  </label>
                  <input
                    className="mt-1 input input-bordered w-full"
                    placeholder="ชื่อผู้รับ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    เบอร์โทรผู้รับ
                  </label>
                  <input
                    className="mt-1 input input-bordered w-full"
                    placeholder="เบอร์โทร"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ที่อยู่จัดส่ง
                  </label>
                  <textarea
                    className="mt-1 textarea textarea-bordered w-full"
                    placeholder="ที่อยู่ละเอียด + จุดสังเกต"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ลิงก์แผนที่ (ถ้ามี)
                  </label>
                  <input
                    className="mt-1 input input-bordered w-full"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
