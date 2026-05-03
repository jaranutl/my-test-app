"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { DatePickerInput } from "@mantine/dates";
import { Autocomplete } from "@mantine/core";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { api} from "@/lib/axios";

import { v4 as uuidv4 } from "uuid";

dayjs.locale("th");

export const Formflower = () => {
    const [pickupMode, setPickupMode] = useState<"workin" | "delivery">("workin");
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
    const [deliveryTime, setDeliveryTime] = useState<string>("");
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [flowerTypes, setFlowerTypes] = useState<string[]>([]);

    useEffect(() => {
        api.get("/api/gets/flowers").then((res) => {
            const names = res.data.data.map((item: { name: string }) => item.name);
            setFlowerTypes(names);
        });
    }, []);

    const [roseColors, setRoseColors] = useState<string[]>([]);

    useEffect(() => {
        api.get("/api/gets/rose_colors").then((res) => {
            const colors = res.data.data.map((item: { color: string }) => item.color);
            setRoseColors(colors);
        });
    }, []);

    const [lilyColors, setLilyColors] = useState<string[]>([]);

    useEffect(() => {
        api.get("/api/gets/lily_colors").then((res) => {
            const colors = res.data.data.map((item: { color: string }) => item.color);
            setLilyColors(colors);
        }
        );
    }, []);

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

    const addRow = () => {
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

        // reset color when flower type changes, auto-select first color if available
        if (field === "type") {
            let defaultColor = "";
            if (value === "กุหลาบ" && roseColors.length > 0) defaultColor = roseColors[0];
            else if (value === "ลิลลี่" && lilyColors.length > 0) defaultColor = lilyColors[0];
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, color: defaultColor } : row
                )
            );
        }

    };

    const FLOWER_TYPES_WITH_COLORS = ["กุหลาบ", "ลิลลี่"];

    const isRowValid = (row: Row) => {
        const requiresColor = FLOWER_TYPES_WITH_COLORS.includes(row.type);
        return (
            row.type.trim() !== "" &&
            (!requiresColor || row.color.trim() !== "") &&
            row.quantity >= 1
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
                                        <select
                                            className="select"
                                            value={row.type || ""}
                                            onChange={(e) => handleChange(row.id, "type", e.target.value)}
                                        >
                                            <option value="" disabled>เลือกชนิดดอกไม้</option>
                                            {flowerTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    {/* สี */}
                                    <td>
                                        <select className="select"
                                            value={row.color }
                                            onChange={(e) => handleChange(row.id, "color", e.target.value)}
                                        >
                                            <option value=" " disabled>เลือกสีดอกไม้</option>
                                            {row.type === "กุหลาบ" ? (
                                                roseColors.map((color) => (
                                                    <option key={color} value={color}>
                                                        {color}
                                                    </option>
                                                ))
                                            ) : row.type === "ลิลลี่" ? (
                                                lilyColors.map((color) => (
                                                    <option key={color} value={color}>
                                                        {color}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="เลือกสีไม่ได้">
                                                    เลือกสีดอกไม้
                                                </option>
                                            )}
                                        </select>
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
                                                className={`btn btn-sm ${rows.length <= 1
                                                        ? "btn-disabled"
                                                        : "btn-error text-white"
                                                    }`}
                                            >
                                                X
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    onClick={addRow}
                    disabled={!canAdd}
                    className={`mt-3 btn btn-sm ${!canAdd ? "btn-disabled" : "btn-primary text-white"
                        }`}
                >
                    + เพิ่มชนิดดอกไม้
                </button>
            </div>

            {/* RIGHT: form */}
            <div className="card h-auto grow flex flex-row gap-3">
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

                    {/* Card message */}
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex flex-row gap-2">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-md"
                                onChange={handleToggle}
                            />
                            <label
                                htmlFor="cardMessage"
                                className="block text-md font-medium text-gray-700"
                            >
                                เขียนการ์ดอวยพร
                            </label>
                            <span className="label text-sm">(ไม่บังคับ)</span>
                        </div>
                        {isVisible && (
                            <textarea
                                id="cardMessage"
                                name="cardMessage"
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 lg:text-md"
                                placeholder="กรอกข้อความสำหรับการ์ดอวยพร"
                            />
                        )}
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

                    {/* Pickup mode */}
                    <div className="flex items-center gap-8 mb-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="pickup"
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
                                name="delivery"
                                className="radio radio-primary radio-md"
                                checked={pickupMode === "delivery"}
                                onChange={() => setPickupMode("delivery")}
                            />
                            <span className="ml-2 text-md">ให้จัดส่ง</span>
                        </label>
                    </div>

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
                                minDate={new Date()}
                                withWeekNumbers={false}
                                dropdownType="popover"
                                firstDayOfWeek={1} // จันทร์เป็นวันแรก (เหมาะกับไทย)
                                // ✅ กัน DaisyUI/Tailwind ชน + บังคับ grid ของ calendar ให้สวย
                                styles={{
                                    calendar: { tableLayout: "fixed" },
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
                </div>

                {/* Delivery fields */}
                {pickupMode === "delivery" && (
                    <div className="flex flex-col gap-3 mt-2 p-3 rounded-md border border-gray-200">
                        <div className="text-sm font-medium text-gray-700">
                            ข้อมูลจัดส่ง (แสดงเมื่อเลือก “ให้จัดส่ง”)
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                ชื่อผู้รับ
                            </label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="ชื่อผู้รับ"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                เบอร์โทรผู้รับ
                            </label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="เบอร์โทร"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                ที่อยู่จัดส่ง
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                placeholder="ที่อยู่ละเอียด + จุดสังเกต"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                ลิงก์แผนที่ (ถ้ามี)
                            </label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
