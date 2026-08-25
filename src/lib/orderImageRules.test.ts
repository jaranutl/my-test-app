import assert from "node:assert/strict";
import test from "node:test";
import { validateOrderImage } from "./orderImageRules.ts";

test("accepts supported images within the upload limit", () => {
  assert.equal(validateOrderImage({ type: "image/jpeg", size: 1024 }), null);
});

test("rejects unsupported and oversized files", () => {
  assert.equal(validateOrderImage({ type: "image/heic", size: 1024 }), "รองรับเฉพาะไฟล์ JPEG, PNG และ WebP");
  assert.equal(validateOrderImage({ type: "image/png", size: 10 * 1024 * 1024 + 1 }), "รูปภาพต้องมีขนาดไม่เกิน 10 MB");
});
