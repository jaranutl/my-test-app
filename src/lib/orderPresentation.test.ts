import assert from "node:assert/strict";
import test from "node:test";
import { formatOrderTime } from "./orderPresentation.ts";

test("database time is rendered as HH:mm in Thai", () => {
  assert.equal(formatOrderTime("09:00:00"), "09:00 น.");
  assert.equal(formatOrderTime("23:59:00+07"), "23:59 น.");
});

test("missing or malformed time has an explicit fallback", () => {
  assert.equal(formatOrderTime(null), "—");
  assert.equal(formatOrderTime("9:00"), "—");
});
