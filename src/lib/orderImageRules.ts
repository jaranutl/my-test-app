export const ORDER_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const ORDER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const validateOrderImage = (file: { type: string; size: number }) => {
  if (!(ORDER_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "รองรับเฉพาะไฟล์ JPEG, PNG และ WebP";
  }
  if (file.size > ORDER_IMAGE_MAX_BYTES) return "รูปภาพต้องมีขนาดไม่เกิน 10 MB";
  return null;
};
