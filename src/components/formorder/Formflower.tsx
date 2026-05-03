"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { api } from "@/lib/axios";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setRows, setPickUpMode, setDeliveryDate, setDeliveryTime,
    setPaperColor, setBowColor, setCardText, setFlowerPrice,
    setReceiverName, setReceiverPhone, setAddressName, setMapURL,
} from "@/store/orderSlice";
 
dayjs.locale("th");

type Row = { id: string; type: string; color: string; quantity: number };

const MAX_ROWS = 5;
const FLOWER_TYPES_WITH_COLORS = ["กุหลาบ", "ลิลลี่"];

export const Formflower = () => {
    const dispatch = useAppDispatch();

    // Redux state
    const rows = useAppSelector((s) => s.order.rows);
    const pickupMode = useAppSelector((s) => s.order.pickUpMode) as "walkin" | "delivery";
    const deliveryDate = useAppSelector((s) => s.order.deliveryDate);
    const deliveryTime = useAppSelector((s) => s.order.deliveryTime);
    const paperColor = useAppSelector((s) => s.order.paperColor);
    const bowColor = useAppSelector((s) => s.order.bowColor);
    const cardText = useAppSelector((s) => s.order.cardText);
    const flowerPrice = useAppSelector((s) => s.order.flowerPrice);
    const receiverName = useAppSelector((s) => s.order.receiverName);
    const receiverPhone = useAppSelector((s) => s.order.receiverPhone);
    const addressName = useAppSelector((s) => s.order.addressName);
    const mapURL = useAppSelector((s) => s.order.mapURL);

    // Local UI state
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [flowerTypes, setFlowerTypes] = useState<string[]>([]);
    const [roseColors, setRoseColors] = useState<string[]>([]);
    const [lilyColors, setLilyColors] = useState<string[]>([]);

    useEffect(() => {
        api.get("/api/gets/flowers").then((res) => {
            setFlowerTypes(res.data.data.map((item: { name: string }) => item.name));
        });
    }, []);

    useEffect(() => {
        api.get("/api/gets/rose_colors").then((res) => {
            setRoseColors(res.data.data.map((item: { color: string }) => item.color));
        });
    }, []);

    useEffect(() => {
        api.get("/api/gets/lily_colors").then((res) => {
            setLilyColors(res.data.data.map((item: { color: string }) => item.color));
        });
    }, []);

    const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
        setIsVisible(e.target.checked);
    };

    const addRow = () => {
        dispatch(setRows([...rows, { id: uuidv4(), type: "", color: "", quantity: 1 }]));
    };

    const removeRow = (id: string) => {
        if (rows.length <= 1) return;
        dispatch(setRows(rows.filter((row) => row.id !== id)));
    };

    const handleChange = <K extends keyof Row>(id: string, field: K, value: Row[K]) => {
        let updated = rows.map((row) => (row.id === id ? { ...row, [field]: value } : row));

        if (field === "type") {
            let defaultColor = "";
            if (value === "กุหลาบ" && roseColors.length > 0) defaultColor = roseColors[0];
            else if (value === "ลิลลี่" && lilyColors.length > 0) defaultColor = lilyColors[0];
            updated = updated.map((row) => row.id === id ? { ...row, color: defaultColor } : row);
        }

        dispatch(setRows(updated));
    };

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
                                    <td>
                                        <select
                                            className="select"
                                            value={row.type || ""}
                                            onChange={(e) => handleChange(row.id, "type", e.target.value)}
                                        >
                                            <option value="" disabled>เลือกชนิดดอกไม้</option>
                                            {flowerTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="select"
                                            value={row.color}
                                            onChange={(e) => handleChange(row.id, "color", e.target.value)}
                                        >
                                            <option value="" disabled>เลือกสีดอกไม้</option>
                                            {row.type === "กุหลาบ" ? (
                                                roseColors.map((color) => (
                                                    <option key={color} value={color}>{color}</option>
                                                ))
                                            ) : row.type === "ลิลลี่" ? (
                                                lilyColors.map((color) => (
                                                    <option key={color} value={color}>{color}</option>
                                                ))
                                            ) : (
                                                <option value="">เลือกสีดอกไม้</option>
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                step={1}
                                                className="input input-bordered w-24"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    handleChange(row.id, "quantity", Number(e.target.value))
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRow(row.id)}
                                                disabled={rows.length <= 1}
                                                className={`btn btn-sm ${rows.length <= 1 ? "btn-disabled" : "btn-error text-white"}`}
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
                    className={`mt-3 btn btn-sm ${!canAdd ? "btn-disabled" : "btn-primary text-white"}`}
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
                            value={paperColor}
                            onChange={(e) => dispatch(setPaperColor(e.target.value))}
                            className="select select-bordered w-full max-w-xs"
                        >
                            <option value="" disabled>กรุณาเลือกสี</option>
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
                            value={bowColor}
                            onChange={(e) => dispatch(setBowColor(e.target.value))}
                            className="select select-bordered w-full max-w-xs"
                        >
                            <option value="" disabled>กรุณาเลือกสี</option>
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
                            <label htmlFor="cardMessage" className="block text-md font-medium text-gray-700">
                                เขียนการ์ดอวยพร
                            </label>
                            <span className="label text-sm">(ไม่บังคับ)</span>
                        </div>
                        {isVisible && (
                            <textarea
                                id="cardMessage"
                                name="cardMessage"
                                rows={4}
                                value={cardText}
                                onChange={(e) => dispatch(setCardText(e.target.value))}
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
                            value={flowerPrice || ""}
                            onChange={(e) => dispatch(setFlowerPrice(Number(e.target.value)))}
                        />
                    </div>

                    {/* Pickup mode */}
                    <div className="flex items-center gap-8 mb-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="walkin"
                                name="pickup"
                                className="radio radio-primary radio-md"
                                checked={pickupMode === "walkin"}
                                onChange={() => dispatch(setPickUpMode("walkin"))}
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
                                onChange={() => dispatch(setPickUpMode("delivery"))}
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
                                value={deliveryDate ? new Date(deliveryDate) : null}
                                onChange={(date) => dispatch(setDeliveryDate(date ? dayjs(date).toISOString() : null))}
                                locale="th"
                                minDate={new Date()}
                                withWeekNumbers={false}
                                dropdownType="popover"
                                firstDayOfWeek={1}
                                styles={{
                                    calendar: { tableLayout: "fixed" },
                                    monthCell: { padding: 2 },
                                    day: { width: 36, height: 36, lineHeight: "36px", fontSize: "14px" },
                                    weekday: { width: 36, height: 28, lineHeight: "28px", fontSize: "13px" },
                                }}
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
                                onChange={(e) => dispatch(setDeliveryTime(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery fields */}
                {pickupMode === "delivery" && (
                    <div className="flex flex-col gap-3 mt-2 p-3 rounded-md border border-gray-200">
                        <div className="text-sm font-medium text-gray-700">
                            ข้อมูลจัดส่ง (แสดงเมื่อเลือก "ให้จัดส่ง")
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">ชื่อผู้รับ</label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="ชื่อผู้รับ"
                                value={receiverName}
                                onChange={(e) => dispatch(setReceiverName(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">เบอร์โทรผู้รับ</label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="เบอร์โทร"
                                value={receiverPhone}
                                onChange={(e) => dispatch(setReceiverPhone(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">ที่อยู่จัดส่ง</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                placeholder="ที่อยู่ละเอียด + จุดสังเกต"
                                value={addressName}
                                onChange={(e) => dispatch(setAddressName(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">ลิงก์แผนที่ (ถ้ามี)</label>
                            <input
                                className="input input-bordered w-full"
                                placeholder="https://maps.google.com/..."
                                value={mapURL}
                                onChange={(e) => dispatch(setMapURL(e.target.value))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
