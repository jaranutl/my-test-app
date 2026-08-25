import { useState, useRef, DragEvent, ChangeEvent, ClipboardEvent as ReactClipboardEvent } from "react";

export type UploadedImage = {
  src: string;
  fileName: string;
  file?: File;
};

type FileUploaderActualProps = {
  onImageChange?: (image: UploadedImage | null) => void;
  initialImage?: UploadedImage | null;
};

export default function FileUploaderActual({
  onImageChange,
  initialImage,
}: FileUploaderActualProps) {
  const [preview, setPreview] = useState<string | null>(initialImage?.src ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>(initialImage?.fileName ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/"))
      return alert("Please upload an image file.");
    setFileName(file.name || "pasted-image.png");
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const nextFileName = file.name || "pasted-image.png";

      setPreview(src);
      onImageChange?.({ src, fileName: nextFileName, file });
    };
    reader.readAsDataURL(file);
  };

  // ✅ Paste handler: Ctrl+V / ⌘V
  const handlePaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    if (preview) return; // ถ้ามีรูปอยู่แล้ว จะไม่ทับ (ปรับได้)
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      // รูปจาก clipboard มักมาเป็น image/png
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onRemove = () => {
    setPreview(null);
    setFileName("");
    onImageChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
    // โฟกัสกลับไปที่ dropzone เพื่อ paste ต่อได้ทันที
    dropRef.current?.focus();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <h2 className="sr-only">
        ช่อที่จัดเสร็จแล้ว
      </h2>

      {/* Drop Zone */}
      {!preview && (
        <div
          ref={dropRef}
          tabIndex={0} // ✅ ทำให้ div รับ focus และ paste ได้
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={handlePaste}
          onClick={() => {
            inputRef.current?.click();
            // ให้ focus ที่ dropzone ด้วย (ผู้ใช้กด ⌘V ต่อได้)
            dropRef.current?.focus();
          }}
          className={`relative flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-3 text-center text-stone-400 outline-none transition
            ${
              isDragging
                ? "scale-[1.02] border-[#dd5f83] bg-rose-50 dark:bg-rose-400/15"
                : "border-stone-300 bg-white hover:border-[#dd5f83] hover:bg-rose-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-rose-400/10"
            }`}
        >
          <svg
            className={`size-5 transition-colors ${isDragging ? "text-[#dd5f83]" : "text-stone-400"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>

          <p className="mt-2 text-xs font-medium text-stone-500">
            {isDragging
              ? "วางรูปที่นี่"
              : "เพิ่มรูปช่อที่จัดเสร็จ"}
          </p>
          <p className="mt-1 text-[10px] text-stone-400">
            PNG, JPG · สูงสุด 10 MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-72 object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
            <span className="text-white text-xs truncate max-w-[75%]">
              {fileName}
            </span>
            <button
              onClick={onRemove}
              className="text-white text-xs font-medium bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
