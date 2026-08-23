"use client";

import { DatePickerInput } from "@mantine/dates";
import type { DateValue } from "@mantine/dates";
import "@mantine/dates/styles.css";
import type { DeliveryInfo, PickupMode } from "./types";

export type FulfilmentFieldsProps = {
  pickupMode: PickupMode;
  deliveryDate: DateValue;
  deliveryTime: string;
  delivery: DeliveryInfo;
  onPickupModeChange: (value: PickupMode) => void;
  onDeliveryDateChange: (value: DateValue) => void;
  onDeliveryTimeChange: (value: string) => void;
  onDeliveryFieldChange: <K extends keyof DeliveryInfo>(field: K, value: DeliveryInfo[K]) => void;
};

const formatThaiPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const FulfilmentFields = ({
  pickupMode,
  deliveryDate,
  deliveryTime,
  delivery,
  onPickupModeChange,
  onDeliveryDateChange,
  onDeliveryTimeChange,
  onDeliveryFieldChange,
}: FulfilmentFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-8">
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="radio"
            name="pickup"
            className="radio radio-primary radio-md"
            checked={pickupMode === "workin"}
            onChange={() => onPickupModeChange("workin")}
          />
          <span className="ml-2 text-sm">รับช่อที่ร้าน</span>
        </label>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="radio"
            name="pickup"
            className="radio radio-primary radio-md"
            checked={pickupMode === "delivery"}
            onChange={() => onPickupModeChange("delivery")}
          />
          <span className="ml-2 text-sm">ให้จัดส่ง</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <DatePickerInput
            clearable
            label="วันที่รับช่อ"
            placeholder="เลือกวันที่"
            value={deliveryDate}
            onChange={onDeliveryDateChange}
            locale="th"
            withWeekNumbers={false}
            dropdownType="popover"
            firstDayOfWeek={1}
            size="md"
            radius="md"
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">เวลาที่รับช่อ</span>
          <input
            type="time"
            className="input input-bordered w-full"
            value={deliveryTime}
            onChange={(e) => onDeliveryTimeChange(e.target.value)}
          />
        </label>
      </div>

      {pickupMode === "delivery" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="mb-3 text-sm font-semibold text-stone-700">รายละเอียดการจัดส่ง</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อผู้รับ</span>
              <input
                className="input input-bordered w-full"
                value={delivery.recipientName}
                onChange={(e) => onDeliveryFieldChange("recipientName", e.target.value)}
                placeholder="ชื่อผู้รับ"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">เบอร์โทรผู้รับ</span>
              <input
                type="tel"
                inputMode="numeric"
                className="input input-bordered w-full"
                value={delivery.recipientPhone}
                onChange={(e) => onDeliveryFieldChange("recipientPhone", formatThaiPhone(e.target.value))}
                placeholder="xxx-xxx-xxxx"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">ที่อยู่จัดส่ง</span>
              <textarea
                className="textarea textarea-bordered w-full"
                value={delivery.address}
                onChange={(e) => onDeliveryFieldChange("address", e.target.value)}
                placeholder="ที่อยู่ละเอียด + จุดสังเกต"
                rows={3}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">ลิงก์แผนที่ (ถ้ามี)</span>
              <input
                className="input input-bordered w-full"
                value={delivery.mapLink}
                onChange={(e) => onDeliveryFieldChange("mapLink", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">ค่าจัดส่ง (บาท)</span>
              <input
                type="number"
                min={0}
                className="input input-bordered w-full"
                value={delivery.deliveryPrice}
                onChange={(e) => onDeliveryFieldChange("deliveryPrice", e.target.value)}
                placeholder="กรอกจำนวนเงิน (บาท)"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
