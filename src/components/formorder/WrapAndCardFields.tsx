"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WrapAndCardFieldsProps = {
  paperColor: string;
  bowColor: string;
  hasCard: boolean;
  cardMessage: string;
  onPaperColorChange: (value: string) => void;
  onBowColorChange: (value: string) => void;
  onHasCardChange: (value: boolean) => void;
  onCardMessageChange: (value: string) => void;
};

type LookupOptions = { paperColors: string[]; bowColors: string[] };

const defaultLookupOptions: LookupOptions = {
  paperColors: ["Crimson", "Amber", "Velvet"],
  bowColors: ["Crimson", "Amber", "Velvet"],
};

const mergeSelectedOption = (options: string[], selected: string) => {
  if (!selected || options.includes(selected)) return options;
  return [selected, ...options];
};

const toOptionNames = (rows: { name: string | null }[] | null) =>
  rows?.map((row) => row.name).filter((name): name is string => Boolean(name)) ?? [];

export const WrapAndCardFields = ({
  paperColor,
  bowColor,
  hasCard,
  cardMessage,
  onPaperColorChange,
  onBowColorChange,
  onHasCardChange,
  onCardMessageChange,
}: WrapAndCardFieldsProps) => {
  const [lookupOptions, setLookupOptions] = useState<LookupOptions>(defaultLookupOptions);

  useEffect(() => {
    let isMounted = true;

    const loadLookupOptions = async () => {
      const supabase = supabaseBrowser();
      const [paperColors, bowColors] = await Promise.all([
        supabase.from("paper_colors").select("name").order("name"),
        supabase.from("bow_colors").select("name").order("name"),
      ]);

      if (!isMounted) return;

      setLookupOptions({
        paperColors:
          toOptionNames(paperColors.data).length > 0
            ? toOptionNames(paperColors.data)
            : defaultLookupOptions.paperColors,
        bowColors:
          toOptionNames(bowColors.data).length > 0
            ? toOptionNames(bowColors.data)
            : defaultLookupOptions.bowColors,
      });
    };

    loadLookupOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">สีกระดาษห่อ</span>
          <Select value={paperColor} onValueChange={onPaperColorChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="กรุณาเลือกสี" />
            </SelectTrigger>
            <SelectContent>
              {mergeSelectedOption(lookupOptions.paperColors, paperColor).map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">สีโบว์</span>
          <Select value={bowColor} onValueChange={onBowColorChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="กรุณาเลือกสี" />
            </SelectTrigger>
            <SelectContent>
              {mergeSelectedOption(lookupOptions.bowColors, bowColor).map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <b className="block text-sm">เขียนการ์ดอวยพร</b>
            <span className="text-xs text-stone-400">ไม่บังคับ · ลูกค้ากรอกข้อความที่ต้องการ</span>
          </div>
          <input
            type="checkbox"
            checked={hasCard}
            onChange={(e) => onHasCardChange(e.target.checked)}
            className="toggle toggle-sm border-stone-300 bg-stone-200 checked:border-[#df6688] checked:bg-[#df6688]"
          />
        </label>

        {hasCard && (
          <div className="mt-4 border-t border-stone-100 pt-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">ข้อความในการ์ด</span>
              <textarea
                value={cardMessage}
                onChange={(e) => onCardMessageChange(e.target.value)}
                rows={4}
                maxLength={300}
                placeholder="เช่น สุขสันต์วันเกิด ขอให้มีความสุขมากๆ"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
              />
            </label>
            <div className="mt-1 flex justify-between text-[10px] text-stone-400">
              <span>ข้อความนี้จะปรากฏในหน้าตรวจสอบและใบออเดอร์</span>
              <span>{cardMessage.length}/300</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
