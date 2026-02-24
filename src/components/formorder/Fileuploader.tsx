import { useState, useRef, DragEvent, ChangeEvent } from "react";

export default function FileUploader() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return alert("Please upload an image file.");
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
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
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-auto max-w-md flex flex-col items-center gap-6 mb-5">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">รูปตัวอย่าง</h2>

            {/* Drop Zone */}
            {!preview && (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 flex flex-col items-center justify-center gap-3
            ${isDragging
                            ? "border-blue-500 bg-blue-50 scale-[1.02]"
                            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                        }`}
                >
                    {/* Upload Icon */}
                    <svg className={`w-12 h-12 transition-colors ${isDragging ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">
                        {isDragging ? "Drop your image here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP up to 10MB</p>

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
                    {/* Overlay bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
                        <span className="text-white text-xs truncate max-w-[75%]">{fileName}</span>
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