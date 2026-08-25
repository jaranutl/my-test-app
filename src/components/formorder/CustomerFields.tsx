"use client";

export type CustomerFieldsProps = {
  lineName: string;
  phone: string;
  note: string;
  onLineNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNoteChange: (value: string) => void;
};

const formatThaiPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const CustomerFields = ({
  lineName,
  phone,
  note,
  onLineNameChange,
  onPhoneChange,
  onNoteChange,
}: CustomerFieldsProps) => {
  return (
    <div className="mx-auto mt-8 max-w-lg space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-stone-500">ชื่อ LINE ลูกค้า</span>
        <input
          type="text"
          value={lineName}
          onChange={(e) => onLineNameChange(e.target.value)}
          placeholder="กรอกชื่อ LINE ลูกค้า"
          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-stone-500">เบอร์โทรศัพท์</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => onPhoneChange(formatThaiPhone(e.target.value))}
          placeholder="xxx-xxx-xxxx"
          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-stone-500">หมายเหตุ</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="บันทึกเพิ่มเติมเกี่ยวกับลูกค้าหรือออเดอร์นี้ (ถ้ามี)"
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#df6688] focus:ring-3 focus:ring-rose-100"
        />
      </label>
    </div>
  );
};
