import type { SKU, Orientation, Grid, SKUPackingResult } from "../types";
import {
  PREFERRED_GRIDS,
  PREFERRED_UNIT_COUNTS,
  MAX_CARTON_DIM_CM,
  MAX_CARTON_WEIGHT_KG,
} from "./constants";

/** All 6 axis-aligned orientations of a box */
export function getOrientations(l: number, w: number, h: number): Orientation[] {
  return [
    { l, w, h },
    { l: l, w: h, h: w },
    { l: w, w: l, h },
    { l: w, w: h, h: l },
    { l: h, w: l, h: w },
    { l: h, w: w, h: l },
  ];
}

/** Snap a raw dimension to the nearest clean warehouse increment */
export function snapDimension(raw: number): number {
  if (raw <= 50) return Math.ceil(raw / 5) * 5;
  if (raw <= 150) return Math.ceil(raw / 10) * 10;
  return Math.ceil(raw / 20) * 20;
}

function scorePacking(
  utilization: number,
  units: number,
  cartonVol: number,
  grid: Grid
): number {
  const utilScore = utilization / 100; // 0–1
  const prefCountScore = PREFERRED_UNIT_COUNTS.has(units) ? 1 : 0;
  // Reward clean grids where no single axis > 4
  const isCleanGrid =
    grid.x <= 4 && grid.y <= 4 && grid.z <= 4 ? 1 : 0;
  // Reward smaller cartons (inverse of volume, normalised to 0–1 roughly)
  const sizeScore = Math.max(0, 1 - cartonVol / 1_000_000);

  return (
    utilScore * 0.5 +
    prefCountScore * 0.25 +
    isCleanGrid * 0.15 +
    sizeScore * 0.1
  );
}

/**
 * Find the best packing layout for a SKU inside a specific carton.
 * Returns null if the SKU cannot fit at all.
 */
export function bestPackingForSKUInCarton(
  sku: SKU,
  cartonL: number,
  cartonW: number,
  cartonH: number
): SKUPackingResult | null {
  const orientations = getOrientations(
    sku.lengthCm,
    sku.widthCm,
    sku.heightCm
  );
  const cartonVol = cartonL * cartonW * cartonH;

  let best: SKUPackingResult | null = null;
  let bestScore = -Infinity;

  for (const ori of orientations) {
    // How many fit along each axis (floor division)
    const nx = Math.floor(cartonL / ori.l);
    const ny = Math.floor(cartonW / ori.w);
    const nz = Math.floor(cartonH / ori.h);

    if (nx === 0 || ny === 0 || nz === 0) continue;

    const units = nx * ny * nz;
    const util = (sku.volumeCm3 * units) / cartonVol * 100;
    const weight = units * sku.weightKg;
    const score = scorePacking(util, units, cartonVol, { x: nx, y: ny, z: nz });

    if (weight > MAX_CARTON_WEIGHT_KG) {
      // Scale down to fit weight limit
      const maxUnits = Math.floor(MAX_CARTON_WEIGHT_KG / sku.weightKg);
      if (maxUnits < 1) continue;
      // We don't change the carton dims — utilisation just drops
    }

    if (score > bestScore) {
      bestScore = score;
      best = {
        sku,
        orientation: ori,
        unitsAlongL: nx,
        unitsAlongW: ny,
        unitsAlongH: nz,
        unitsPerCarton: units,
        layoutLabel: `${nx} × ${ny} × ${nz}`,
        spaceUtilization: Math.min(100, Math.round(util)),
        totalCartonWeightKg: Math.round(units * sku.weightKg * 10) / 10,
      };
    }
  }

  return best;
}

interface CandidateCarton {
  l: number;
  w: number;
  h: number;
  grid: Grid;
  orientation: Orientation;
  units: number;
  utilization: number;
  score: number;
}

/**
 * Propose a carton dimension for a given SKU by trying all orientations × grids.
 * Returns the best raw (pre-snap) candidate.
 */
export function proposeSeedCarton(sku: SKU): CandidateCarton | null {
  const orientations = getOrientations(
    sku.lengthCm,
    sku.widthCm,
    sku.heightCm
  );

  let best: CandidateCarton | null = null;
  let bestScore = -Infinity;

  for (const ori of orientations) {
    for (const grid of PREFERRED_GRIDS) {
      const rawL = ori.l * grid.x;
      const rawW = ori.w * grid.y;
      const rawH = ori.h * grid.z;

      // Snap to clean dimensions
      const cartonL = snapDimension(rawL);
      const cartonW = snapDimension(rawW);
      const cartonH = snapDimension(rawH);

      // Dimension limits
      if (
        cartonL > MAX_CARTON_DIM_CM ||
        cartonW > MAX_CARTON_DIM_CM ||
        cartonH > MAX_CARTON_DIM_CM
      )
        continue;

      const units = grid.x * grid.y * grid.z;
      const totalWeight = units * sku.weightKg;
      if (totalWeight > MAX_CARTON_WEIGHT_KG) continue;

      const cartonVol = cartonL * cartonW * cartonH;
      const skuVol = sku.volumeCm3 * units;
      const utilization = (skuVol / cartonVol) * 100;

      const score = scorePacking(utilization, units, cartonVol, grid);

      if (score > bestScore) {
        bestScore = score;
        best = {
          l: cartonL,
          w: cartonW,
          h: cartonH,
          grid,
          orientation: ori,
          units,
          utilization,
          score,
        };
      }
    }
  }

  return best;
}
