import assert from "node:assert/strict";
import test from "node:test";
import { getAllowedStatusTransitions, validateStatusTransition } from "./orderTransitions.ts";

test("delivery orders move one step forward or backward", () => {
  assert.deepEqual(getAllowedStatusTransitions("wrapping", "delivery"), ["arranging", "ready_for_delivery"]);
});

test("shop pickup skips the Grab handoff step", () => {
  assert.deepEqual(getAllowedStatusTransitions("ready_for_delivery", "workin"), ["wrapping", "delivered"]);
  assert.deepEqual(getAllowedStatusTransitions("delivered", "workin"), ["ready_for_delivery"]);
});

test("transition validation rejects jumps and accepts adjacent steps", () => {
  assert.equal(validateStatusTransition("new", "wrapping", "delivery"), false);
  assert.equal(validateStatusTransition("new", "arranging", "delivery"), true);
  assert.equal(validateStatusTransition("arranging", "new", "delivery"), true);
});
