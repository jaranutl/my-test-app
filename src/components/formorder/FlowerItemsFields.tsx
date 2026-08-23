"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlowerRow } from "./types";
import { MAX_FLOWER_ROWS, isFlowerRowValid } from "./types";

export type FlowerItemsFieldsProps = {
  rows: FlowerRow[];
  bouquetPrice: string;
  onRowChange: <K extends keyof FlowerRow>(id: string, field: K, value: FlowerRow[K]) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onBouquetPriceChange: (value: string) => void;
};

type LookupOptions = {
  flowerTypes: string[];
  roseColors: string[];
  lilyColors: string[];
};

const defaultLookupOptions: LookupOptions = {
  flowerTypes: ["กุหลาบ", "ทานตะวัน", "ลิลลี่", "ไฮเดรนเยีย"],
  roseColors: ["แดง", "ขาว", "ชมพู", "เหลือง"],
  lilyColors: ["ขาว", "ชมพู", "เหลือง", "ส้ม"],
};

const mergeSelectedOption = (options: string[], selected: string) => {
  if (!selected || options.includes(selected)) return options;
  return [selected, ...options];
};

const toOptionNames = (rows: { name: string | null }[] | null) =>
  rows?.map((row) => row.name).filter((name): name is string => Boolean(name)) ?? [];

export const FlowerItemsFields = ({
  rows,
  bouquetPrice,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onBouquetPriceChange,
}: FlowerItemsFieldsProps) => {
  const [lookupOptions, setLookupOptions] = useState<LookupOptions>(defaultLookupOptions);

  useEffect(() => {
    let isMounted = true;

    const loadLookupOptions = async () => {
      const supabase = supabaseBrowser();
      const [flowerTypes, roseColors, lilyColors] = await Promise.all([
        supabase.from("flower_types").select("name").order("name"),
        supabase.from("rose_colors").select("name").order("name"),
        supabase.from("lily_colors").select("name").order("name"),
      ]);

      if (!isMounted) return;

      setLookupOptions({
        flowerTypes:
          toOptionNames(flowerTypes.data).length > 0
            ? toOptionNames(flowerTypes.data)
            : defaultLookupOptions.flowerTypes,
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
    [lookupOptions.roseColors, lookupOptions.lilyColors],
  );

  const getFlowerColorOptions = (flowerType: string) => {
    if (flowerType.includes("กุหลาบ")) return lookupOptions.roseColors;
    if (flowerType.includes("ลิลลี่")) return lookupOptions.lilyColors;
    return allFlowerColors;
  };

  const lastRow = rows[rows.length - 1];
  const canAdd = isFlowerRowValid(lastRow) && rows.length < MAX_FLOWER_ROWS;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <div key={row.id} className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">
                ดอกไม้รายการที่ {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemoveRow(row.id)}
                disabled={rows.length <= 1}
                className="grid size-8 place-items-center rounded-lg border border-stone-200 bg-white text-sm text-stone-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`ลบดอกไม้รายการที่ ${index + 1}`}
              >
                ×
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_96px]">
              <label className="min-w-0">
                <span className="mb-1.5 block text-xs font-medium text-stone-500">ชนิดดอกไม้</span>
                <Select
                  value={row.type}
                  onValueChange={(selectedType) => {
                    onRowChange(row.id, "type", selectedType);
                    if (row.color && !getFlowerColorOptions(selectedType).includes(row.color)) {
                      onRowChange(row.id, "color", "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="เลือกชนิดดอกไม้" />
                  </SelectTrigger>
                  <SelectContent>
                    {mergeSelectedOption(lookupOptions.flowerTypes, row.type).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="min-w-0">
                <span className="mb-1.5 block text-xs font-medium text-stone-500">สี</span>
                <Select value={row.color} onValueChange={(color) => onRowChange(row.id, "color", color)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="เลือกสี" />
                  </SelectTrigger>
                  <SelectContent>
                    {mergeSelectedOption(getFlowerColorOptions(row.type), row.color).map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="min-w-0">
                <span className="mb-1.5 block text-xs font-medium text-stone-500">จำนวน</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="input input-bordered w-full bg-white"
                  value={row.quantity}
                  onChange={(e) => onRowChange(row.id, "quantity", Number(e.target.value))}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddRow}
          disabled={!canAdd}
          className={`btn btn-sm ${!canAdd ? "btn-disabled" : "btn-primary text-white"}`}
        >
          + เพิ่มชนิดดอกไม้ ({rows.length}/{MAX_FLOWER_ROWS})
        </button>
      </div>

      <label className="block max-w-xs">
        <span className="mb-1.5 block text-xs font-medium text-stone-500">ราคาช่อ</span>
        <input
          type="number"
          min={0}
          className="input input-bordered w-full"
          value={bouquetPrice}
          onChange={(e) => onBouquetPriceChange(e.target.value)}
          placeholder="กรอกจำนวนเงิน (บาท)"
        />
      </label>
    </div>
  );
};
