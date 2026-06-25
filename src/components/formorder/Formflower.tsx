"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import type { DateValue } from "@mantine/dates";
import "@mantine/dates/styles.css";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

dayjs.locale("th");

export type PickupMode = "workin" | "delivery";

export type FlowerRow = {
  id: string;
  type: string;
  color: string;
  quantity: number;
};

export type DeliveryInfo = {
  recipientName: string;
  recipientPhone: string;
  address: string;
  mapLink: string;
  deliveryPrice: string;
};

export type FlowerFormData = {
  rows: FlowerRow[];
  hasCard: boolean;
  cardMessage: string;
  paperColor: string;
  bowColor: string;
  bouquetPrice: string;
  deliveryDate: DateValue;
  deliveryTime: string;
  pickupMode: PickupMode;
  delivery: DeliveryInfo;
};

type FormflowerProps = {
  value: FlowerFormData;
  onChange: (value: FlowerFormData) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onRowChange: <K extends keyof FlowerRow>(
    id: string,
    field: K,
    value: FlowerRow[K],
  ) => void;
};

type LookupOptions = {
  flowerTypes: string[];
  paperColors: string[];
  bowColors: string[];
  roseColors: string[];
  lilyColors: string[];
};

const defaultLookupOptions: LookupOptions = {
  flowerTypes: ["กุหลาบ", "ทานตะวัน", "ลิลลี่", "ไฮเดรนเยีย"],
  paperColors: ["Crimson", "Amber", "Velvet"],
  bowColors: ["Crimson", "Amber", "Velvet"],
  roseColors: ["แดง", "ขาว", "ชมพู", "เหลือง"],
  lilyColors: ["ขาว", "ชมพู", "เหลือง", "ส้ม"],
};

const mergeSelectedOption = (options: string[], selected: string) => {
  if (!selected || options.includes(selected)) return options;
  return [selected, ...options];
};

const toOptionNames = (rows: { name: string | null }[] | null) =>
  rows?.map((row) => row.name).filter((name): name is string => Boolean(name)) ??
  [];

export const Formflower = ({
  value,
  onChange,
  onAddRow,
  onRemoveRow,
  onRowChange,
}: FormflowerProps) => {
  const {
    rows,
    hasCard,
    cardMessage,
    paperColor,
    bowColor,
    bouquetPrice,
    deliveryDate,
    deliveryTime,
    pickupMode,
    delivery,
  } = value;
  const isVisible = hasCard;
  const [lookupOptions, setLookupOptions] =
    useState<LookupOptions>(defaultLookupOptions);

  useEffect(() => {
    let isMounted = true;

    const loadLookupOptions = async () => {
      const supabase = supabaseBrowser();

      const [
        flowerTypes,
        paperColors,
        bowColors,
        roseColors,
        lilyColors,
      ] = await Promise.all([
        supabase.from("flower_types").select("name").order("name"),
        supabase.from("paper_colors").select("name").order("name"),
        supabase.from("bow_colors").select("name").order("name"),
        supabase.from("rose_colors").select("name").order("name"),
        supabase.from("lily_colors").select("name").order("name"),
      ]);

      if (!isMounted) return;

      setLookupOptions({
        flowerTypes:
          toOptionNames(flowerTypes.data).length > 0
            ? toOptionNames(flowerTypes.data)
            : defaultLookupOptions.flowerTypes,
        paperColors:
          toOptionNames(paperColors.data).length > 0
            ? toOptionNames(paperColors.data)
            : defaultLookupOptions.paperColors,
        bowColors:
          toOptionNames(bowColors.data).length > 0
            ? toOptionNames(bowColors.data)
            : defaultLookupOptions.bowColors,
        roseColors:
          toOptionNames(roseColors.data).length > 0
            ? toOptionNames(roseColors.data)
            : defaultLookupOptions.roseColors,
        lilyColors:
          toOptionNames(lilyColors.data).length > 0
            ? toOptionNames(lilyColors.data)
            : defaultLookupOptions.lilyColors,
      });
    };

    loadLookupOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const allFlowerColors = useMemo(
    () => Array.from(new Set([...lookupOptions.roseColors, ...lookupOptions.lilyColors])),
    [lookupOptions.lilyColors, lookupOptions.roseColors],
  );

  const getFlowerColorOptions = (flowerType: string) => {
    if (flowerType.includes("กุหลาบ")) return lookupOptions.roseColors;
    if (flowerType.includes("ลิลลี่")) return lookupOptions.lilyColors;
    return allFlowerColors;
  };

  const updateValue = <K extends keyof FlowerFormData>(
    field: K,
    fieldValue: FlowerFormData[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const updateDelivery = <K extends keyof DeliveryInfo>(
    field: K,
    fieldValue: DeliveryInfo[K],
  ) => {
    onChange({
      ...value,
      delivery: { ...delivery, [field]: fieldValue },
    });
  };

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      hasCard: e.target.checked,
      cardMessage: e.target.checked ? cardMessage : "",
    });
  };

  const formatThaiPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6)
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const MAX_ROWS = 4;

  const isRowValid = (row: FlowerRow) => {
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
                    <Select
                      value={row.type}
                      onValueChange={(selectedType) => {
                        onRowChange(row.id, "type", selectedType);

                        if (
                          row.color &&
                          !getFlowerColorOptions(selectedType).includes(
                            row.color,
                          )
                        ) {
                          onRowChange(row.id, "color", "");
                        }
                      }}
                    >
                      <SelectTrigger className="min-w-48">
                        <SelectValue placeholder="เลือกชนิดดอกไม้" />
                      </SelectTrigger>
                      <SelectContent>
                        {mergeSelectedOption(
                          lookupOptions.flowerTypes,
                          row.type,
                        ).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* สี */}
                  <td>
                    <Select
                      value={row.color}
                      onValueChange={(color) =>
                        onRowChange(row.id, "color", color)
                      }
                    >
                      <SelectTrigger className="min-w-36">
                        <SelectValue placeholder="เลือกสี" />
                      </SelectTrigger>
                      <SelectContent>
                        {mergeSelectedOption(
                          getFlowerColorOptions(row.type),
                          row.color,
                        ).map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          onRowChange(
                            row.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => onRemoveRow(row.id)}
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
            onClick={onAddRow}
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
              checked={isVisible}
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
              value={cardMessage}
              onChange={(e) => updateValue("cardMessage", e.target.value)}
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
            <Select
              value={paperColor}
              onValueChange={(color) => updateValue("paperColor", color)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="กรุณาเลือกสี" />
              </SelectTrigger>
              <SelectContent>
                {mergeSelectedOption(
                  lookupOptions.paperColors,
                  paperColor,
                ).map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bow color */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              สีโบว์
            </label>
            <Select
              value={bowColor}
              onValueChange={(color) => updateValue("bowColor", color)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="กรุณาเลือกสี" />
              </SelectTrigger>
              <SelectContent>
                {mergeSelectedOption(lookupOptions.bowColors, bowColor).map(
                  (color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
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
              value={bouquetPrice}
              onChange={(e) => updateValue("bouquetPrice", e.target.value)}
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
                onChange={(date) => updateValue("deliveryDate", date)}
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
                onChange={(e) => updateValue("deliveryTime", e.target.value)}
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
                onChange={() => updateValue("pickupMode", "workin")}
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
                onChange={() => updateValue("pickupMode", "delivery")}
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
                    value={delivery.recipientName}
                    onChange={(e) =>
                      updateDelivery("recipientName", e.target.value)
                    }
                    placeholder="ชื่อผู้รับ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    เบอร์โทรผู้รับ
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={delivery.recipientPhone}
                    onChange={(e) =>
                      updateDelivery(
                        "recipientPhone",
                        formatThaiPhone(e.target.value),
                      )
                    }
                    placeholder="xxx-xxx-xxxx"
                    className="mt-1 input input-bordered w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ที่อยู่จัดส่ง
                  </label>
                  <textarea
                    className="mt-1 textarea textarea-bordered w-full"
                    value={delivery.address}
                    onChange={(e) => updateDelivery("address", e.target.value)}
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
                    value={delivery.mapLink}
                    onChange={(e) => updateDelivery("mapLink", e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    ราคาค่าจัดส่ง
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="input input-bordered w-full max-w-xs"
                    value={delivery.deliveryPrice}
                    onChange={(e) =>
                      updateDelivery("deliveryPrice", e.target.value)
                    }
                    placeholder="กรอกจำนวนเงิน (บาท)"
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
