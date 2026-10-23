export interface SparklineCoords {
  linePath: string;
  areaPath: string;
  lastPoint: { x: number; y: number; val: number };
  isAllZero: boolean;
}

/**
 * Computes smooth cubic Bezier path and area fill for a sequence of 0-100 values.
 */
export function computeSparkline(
  points: readonly number[],
  width: number,
  height: number,
): SparklineCoords {
  const padX = 4;
  const padY = 4;
  const usableW = Math.max(1, width - padX * 2);
  const usableH = Math.max(1, height - padY * 2);
  const baselineY = height - padY; // y = 28 when height is 32

  const safePoints =
    points.length === 0 ? [0, 0] : points.length === 1 ? [points[0], points[0]] : points;
  const n = safePoints.length;
  const isAllZero = safePoints.every((v) => !v || v <= 0);

  const coords = safePoints.map((val, idx) => {
    const clamped = Math.max(0, Math.min(100, Number.isFinite(val) ? val : 0));
    const x = padX + (idx / (n - 1)) * usableW;
    // Map 0 -> baselineY (28), 100 -> padY (4)
    const y = baselineY - (clamped / 100) * usableH;
    return { x, y, val: clamped };
  });

  // Build smooth cubic Bezier curve
  let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const midX = p0.x + (p1.x - p0.x) / 2;
    // Horizontal tangent S-curve avoids overshoot
    linePath += ` C ${midX.toFixed(1)} ${p0.y.toFixed(1)}, ${midX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;

  return {
    linePath,
    areaPath,
    lastPoint: last,
    isAllZero,
  };
}
