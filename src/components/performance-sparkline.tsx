"use client";

import { useId, useMemo } from "react";
import { computeSparkline } from "@/lib/sparkline";

export interface PerformanceSparklineProps {
  /** Array of performance values from 0 to 100. */
  points: readonly number[];
  /** Primary stroke color (hex or rgb). */
  color: string;
  /** Width in SVG coordinate units (default 92). */
  width?: number;
  /** Height in SVG coordinate units (default 32). */
  height?: number;
  /** Accessible label describing current performance for screen readers. */
  ariaLabel?: string;
  /** Optional extra CSS classes. */
  className?: string;
}

export function PerformanceSparkline({
  points,
  color,
  width = 92,
  height = 32,
  ariaLabel = "Grafik performa belajar",
  className = "",
}: PerformanceSparklineProps) {
  const uid = useId();
  const gradId = `spark-grad-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const { linePath, areaPath, lastPoint, isAllZero } = useMemo(
    () => computeSparkline(points, width, height),
    [points, width, height],
  );

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={`shrink-0 overflow-visible ${className}`}
    >
      <title>{ariaLabel}</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isAllZero ? 0.08 : 0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Area gradient fill below the curve */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Main performance sparkline curve */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={isAllZero ? 1.6 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isAllZero ? "3 3" : undefined}
        opacity={isAllZero ? 0.5 : 1}
      />

      {/* Active/Latest performance indicator marker */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={isAllZero ? 2 : 2.8}
        fill={color}
      />
      {!isAllZero && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={5.5}
          fill={color}
          opacity={0.25}
        />
      )}
    </svg>
  );
}
