"use client";

import { DatePickerInput } from "@mantine/dates";

export type DateRange = { start: Date; end: Date };

type DateRangeFilterProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

const startOfDay = (date: Date | string) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date | string) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const applyPreset = (days: number) => {
    onChange({ start: startOfDay(daysAgo(days)), end: endOfDay(new Date()) });
  };

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
      <button type="button" onClick={() => applyPreset(0)} className="btn btn-sm btn-outline">
        วันนี้
      </button>
      <button type="button" onClick={() => applyPreset(6)} className="btn btn-sm btn-outline">
        7 วัน
      </button>
      <button type="button" onClick={() => applyPreset(29)} className="btn btn-sm btn-outline">
        30 วัน
      </button>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">จากวันที่</label>
        <DatePickerInput
          size="sm"
          value={value.start}
          onChange={(date) => date && onChange({ ...value, start: startOfDay(date) })}
          locale="th"
          dropdownType="popover"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">ถึงวันที่</label>
        <DatePickerInput
          size="sm"
          value={value.end}
          onChange={(date) => date && onChange({ ...value, end: endOfDay(date) })}
          locale="th"
          dropdownType="popover"
        />
      </div>
    </div>
  );
};
