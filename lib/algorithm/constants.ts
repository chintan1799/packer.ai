import type { Grid } from "../types";

// Preferred grid arrangements — warehouse-friendly layouts
// Ordered by preference (clean, stable, easy to count)
export const PREFERRED_GRIDS: Grid[] = [
  { x: 3, y: 4, z: 2 }, // 24 units — most preferred
  { x: 2, y: 3, z: 2 }, // 12 units — preferred
  { x: 4, y: 3, z: 3 }, // 36 units — preferred
  { x: 3, y: 3, z: 2 }, // 18 units
  { x: 2, y: 2, z: 3 }, // 12 units
  { x: 4, y: 4, z: 2 }, // 32 units
  { x: 3, y: 4, z: 3 }, // 36 units
  { x: 2, y: 2, z: 2 }, // 8 units
  { x: 5, y: 4, z: 2 }, // 40 units
  { x: 2, y: 3, z: 3 }, // 18 units
  { x: 4, y: 3, z: 2 }, // 24 units
  { x: 2, y: 2, z: 1 }, // 4 units — fallback for large SKUs
  { x: 3, y: 2, z: 1 }, // 6 units — fallback
  { x: 2, y: 3, z: 1 }, // 6 units — fallback
  { x: 3, y: 3, z: 1 }, // 9 units — fallback
  { x: 4, y: 3, z: 1 }, // 12 units — fallback
  { x: 1, y: 2, z: 1 }, // 2 units — large SKU fallback
  { x: 1, y: 1, z: 1 }, // 1 unit — oversized
];

// Unit counts that look clean and are easy to count in a warehouse
export const PREFERRED_UNIT_COUNTS = new Set([12, 24, 36]);

// Ergonomic and dimensional limits
export const MAX_CARTON_DIM_CM = 120;
export const MAX_CARTON_WEIGHT_KG = 25;

// Utilization thresholds
export const UTIL_GOOD = 75;      // % — green
export const UTIL_MARGINAL = 65;  // % — amber; below this = red / uncovered
export const UTIL_MIN_COMPAT = 70; // % — minimum to consider a SKU compatible with a carton
