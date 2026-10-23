import assert from "node:assert/strict";
import test from "node:test";

import { computeSparkline } from "../src/lib/sparkline.ts";

test("sparkline maps 0% values cleanly to bottom baseline", () => {
  const result = computeSparkline([0, 0, 0], 92, 32);
  assert.equal(result.isAllZero, true);
  assert.equal(result.lastPoint.y, 28);
  assert.equal(result.lastPoint.val, 0);
  assert.match(result.linePath, /^M 4\.0 28\.0/);
  assert.ok(result.areaPath.endsWith("L 4.0 28.0 Z"));
});

test("sparkline maps 100% values cleanly to top ceiling", () => {
  const result = computeSparkline([100, 100, 100], 92, 32);
  assert.equal(result.isAllZero, false);
  assert.equal(result.lastPoint.y, 4);
  assert.equal(result.lastPoint.val, 100);
  assert.match(result.linePath, /^M 4\.0 4\.0/);
});

test("sparkline smoothly ascends from 0% to 100% with intermediate 50%", () => {
  const result = computeSparkline([0, 50, 100], 92, 32);
  assert.equal(result.isAllZero, false);
  assert.equal(result.lastPoint.x, 88);
  assert.equal(result.lastPoint.y, 4);
  // Intermediate point at 50% should be at y = 16
  assert.match(result.linePath, /46\.0 16\.0/);
});

test("sparkline gracefully handles empty and single-value arrays", () => {
  const emptyRes = computeSparkline([], 92, 32);
  assert.equal(emptyRes.isAllZero, true);
  assert.equal(emptyRes.lastPoint.y, 28);

  const singleRes = computeSparkline([75], 92, 32);
  assert.equal(singleRes.isAllZero, false);
  assert.equal(singleRes.lastPoint.val, 75);
  // 75% -> 28 - 0.75 * 24 = 10
  assert.equal(singleRes.lastPoint.y, 10);
});

test("sparkline clamps negative and overflowing values to 0-100", () => {
  const result = computeSparkline([-20, 150], 92, 32);
  assert.equal(result.lastPoint.val, 100);
  assert.equal(result.lastPoint.y, 4);
});

test("sparkline generates valid SVG cubic Bezier commands without NaN", () => {
  const points = [10, 20, 0, 45, 80, 60, 95, 30, 40, 50, 65];
  const result = computeSparkline(points, 92, 32);
  assert.doesNotMatch(result.linePath, /NaN/);
  assert.doesNotMatch(result.areaPath, /NaN/);
  assert.ok(result.linePath.includes(" C "));
  assert.equal(result.lastPoint.val, 65);
});
