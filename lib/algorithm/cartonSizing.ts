import type {
  SKU,
  SKUCluster,
  SKUPackingResult,
  CartonRecommendation,
  ClusterLabel,
  Orientation,
} from "../types";
import {
  proposeSeedCarton,
  bestPackingForSKUInCarton,
  getOrientations,
  snapDimension,
} from "./packingEngine";
import { MAX_CARTON_DIM_CM, MAX_CARTON_WEIGHT_KG } from "./constants";

const CLUSTER_LABEL_ORDER: ClusterLabel[] = ["Small", "Medium", "Large"];

// Minimum utilization to include a SKU in a standard carton (lowered to 60% so
// borderline SKUs are captured before falling through to custom cartons)
const STANDARD_COMPAT_UTIL = 60;

// Target unit range for custom-sized cartons
const CUSTOM_UNITS_MIN = 25;
const CUSTOM_UNITS_MAX = 40;

// Grids that yield 25–40 units, ordered by warehouse practicality
const CUSTOM_TARGET_GRIDS = [
  { x: 5, y: 3, z: 2 }, // 30
  { x: 4, y: 4, z: 2 }, // 32
  { x: 3, y: 3, z: 3 }, // 27
  { x: 4, y: 3, z: 3 }, // 36
  { x: 5, y: 4, z: 2 }, // 40
  { x: 5, y: 2, z: 3 }, // 30
  { x: 6, y: 5, z: 1 }, // 30
  { x: 5, y: 5, z: 1 }, // 25
  { x: 6, y: 3, z: 2 }, // 36
  { x: 7, y: 4, z: 1 }, // 28
  { x: 8, y: 4, z: 1 }, // 32
  { x: 5, y: 7, z: 1 }, // 35
  { x: 6, y: 6, z: 1 }, // 36
];

export function cartonLabel(index: number): string {
  return `Carton ${String.fromCharCode(65 + index)}`; // A, B, C…
}

function clusterLabelForVolume(volumeCm3: number): ClusterLabel {
  if (volumeCm3 < 500) return "Small";
  if (volumeCm3 < 5000) return "Medium";
  return "Large";
}

/** Build a CartonRecommendation from raw dimensions + all SKUs */
function buildCarton(
  id: string,
  l: number,
  w: number,
  h: number,
  clusterLabel: ClusterLabel,
  allSKUs: SKU[]
): CartonRecommendation {
  const vol = l * w * h;
  const skuPackings: SKUPackingResult[] = [];

  for (const sku of allSKUs) {
    const packing = bestPackingForSKUInCarton(sku, l, w, h);
    if (packing && packing.spaceUtilization >= STANDARD_COMPAT_UTIL) {
      skuPackings.push(packing);
    }
  }

  const avgUtilization =
    skuPackings.length > 0
      ? Math.round(
          skuPackings.reduce((s, p) => s + p.spaceUtilization, 0) /
            skuPackings.length
        )
      : 0;

  return {
    id,
    label: "",
    clusterLabel,
    lengthCm: l,
    widthCm: w,
    heightCm: h,
    volumeCm3: vol,
    skuPackings,
    avgUtilization,
  };
}

/**
 * For each cluster, propose a carton using the cluster's "representative" SKU
 * (the one whose seed carton scores best).
 */
export function proposeCartonsFromClusters(
  clusters: SKUCluster[],
  allSKUs: SKU[]
): CartonRecommendation[] {
  const cartons: CartonRecommendation[] = [];

  for (const cluster of clusters) {
    let bestCarton: CartonRecommendation | null = null;
    let bestScore = -Infinity;

    for (const sku of cluster.skus) {
      const seed = proposeSeedCarton(sku);
      if (!seed) continue;

      const candidate = buildCarton(
        `${cluster.label}-${sku.id}`,
        seed.l,
        seed.w,
        seed.h,
        cluster.label,
        allSKUs
      );

      const score =
        candidate.avgUtilization * 0.6 +
        candidate.skuPackings.length * 10 * 0.4;

      if (score > bestScore) {
        bestScore = score;
        bestCarton = candidate;
      }
    }

    if (bestCarton) {
      cartons.push(bestCarton);
    }
  }

  return cartons;
}

/** Check if two cartons are "near-identical" (within 15% in all dims) */
function nearlyEqual(
  a: CartonRecommendation,
  b: CartonRecommendation
): boolean {
  const withinPct = (x: number, y: number) =>
    Math.abs(x - y) / Math.max(x, y) <= 0.15;

  const dimsA = [a.lengthCm, a.widthCm, a.heightCm].sort((x, y) => x - y);
  const dimsB = [b.lengthCm, b.widthCm, b.heightCm].sort((x, y) => x - y);

  return (
    withinPct(dimsA[0], dimsB[0]) &&
    withinPct(dimsA[1], dimsB[1]) &&
    withinPct(dimsA[2], dimsB[2])
  );
}

/**
 * Merge near-identical cartons, sort by volume, assign labels.
 * No hard cap — custom cartons are appended by the caller after this.
 */
export function deduplicateAndFinalize(
  cartons: CartonRecommendation[]
): CartonRecommendation[] {
  const merged: CartonRecommendation[] = [];

  for (const carton of cartons) {
    const existing = merged.find((m) => nearlyEqual(m, carton));
    if (existing) {
      if (carton.avgUtilization > existing.avgUtilization) {
        const idx = merged.indexOf(existing);
        merged[idx] = carton;
      }
    } else {
      merged.push(carton);
    }
  }

  return merged
    .sort((a, b) => {
      const ai = CLUSTER_LABEL_ORDER.indexOf(a.clusterLabel);
      const bi = CLUSTER_LABEL_ORDER.indexOf(b.clusterLabel);
      if (ai !== bi) return ai - bi;
      return a.volumeCm3 - b.volumeCm3;
    })
    .map((c, i) => ({ ...c, label: cartonLabel(i) }));
}

/**
 * Build a custom-sized carton for a single uncovered SKU, targeting 25–40 units.
 * Falls back to the highest feasible unit count if weight/dimension limits apply.
 */
export function buildCustomCarton(
  sku: SKU,
  labelIndex: number
): CartonRecommendation {
  const orientations = getOrientations(sku.lengthCm, sku.widthCm, sku.heightCm);

  let bestOri: Orientation | null = null;
  let bestGrid = { x: 1, y: 1, z: 1 };
  let bestUnits = 1;
  let bestUtil = 0;
  let bestScore = -Infinity;

  // Try all orientations × custom target grids (25–40 units)
  for (const ori of orientations) {
    for (const grid of CUSTOM_TARGET_GRIDS) {
      const units = grid.x * grid.y * grid.z;
      if (units < CUSTOM_UNITS_MIN || units > CUSTOM_UNITS_MAX) continue;
      if (units * sku.weightKg > MAX_CARTON_WEIGHT_KG) continue;

      const rawL = ori.l * grid.x;
      const rawW = ori.w * grid.y;
      const rawH = ori.h * grid.z;
      const cartonL = snapDimension(rawL);
      const cartonW = snapDimension(rawW);
      const cartonH = snapDimension(rawH);

      if (
        cartonL > MAX_CARTON_DIM_CM ||
        cartonW > MAX_CARTON_DIM_CM ||
        cartonH > MAX_CARTON_DIM_CM
      )
        continue;

      const cartonVol = cartonL * cartonW * cartonH;
      const util = (sku.volumeCm3 * units) / cartonVol * 100;
      // Score: prioritise utilization then closeness to 30 units
      const score = util * 0.6 + (1 - Math.abs(units - 30) / 15) * 0.4;

      if (score > bestScore) {
        bestScore = score;
        bestOri = ori;
        bestGrid = grid;
        bestUnits = units;
        bestUtil = util;
      }
    }
  }

  // Fallback: weight limit prevents 25+ units — use max feasible units
  if (bestOri === null) {
    const maxSafeUnits = Math.max(
      1,
      Math.floor(MAX_CARTON_WEIGHT_KG / sku.weightKg)
    );
    // Pick the orientation that gives best utilization at maxSafeUnits
    for (const ori of orientations) {
      // Simple 1-layer grid that gets close to maxSafeUnits
      const nx = Math.min(6, Math.ceil(Math.sqrt(maxSafeUnits)));
      const ny = Math.min(6, Math.ceil(maxSafeUnits / nx));
      const units = nx * ny;
      const rawL = snapDimension(ori.l * nx);
      const rawW = snapDimension(ori.w * ny);
      const rawH = snapDimension(ori.h);
      const vol = rawL * rawW * rawH;
      const util = (sku.volumeCm3 * units) / vol * 100;
      if (util > bestUtil) {
        bestUtil = util;
        bestOri = ori;
        bestGrid = { x: nx, y: ny, z: 1 };
        bestUnits = units;
      }
    }
    // Last resort
    if (bestOri === null) bestOri = orientations[0];
  }

  const ori = bestOri;
  const cartonL = snapDimension(ori.l * bestGrid.x);
  const cartonW = snapDimension(ori.w * bestGrid.y);
  const cartonH = snapDimension(ori.h * bestGrid.z);
  const cartonVol = cartonL * cartonW * cartonH;
  const util = Math.round((sku.volumeCm3 * bestUnits) / cartonVol * 100);

  const packing: SKUPackingResult = {
    sku,
    orientation: ori,
    unitsAlongL: bestGrid.x,
    unitsAlongW: bestGrid.y,
    unitsAlongH: bestGrid.z,
    unitsPerCarton: bestUnits,
    layoutLabel: `${bestGrid.x} × ${bestGrid.y} × ${bestGrid.z}`,
    spaceUtilization: Math.min(100, util),
    totalCartonWeightKg: Math.round(bestUnits * sku.weightKg * 10) / 10,
  };

  return {
    id: `custom-${sku.id}`,
    label: cartonLabel(labelIndex),
    clusterLabel: clusterLabelForVolume(sku.volumeCm3),
    lengthCm: cartonL,
    widthCm: cartonW,
    heightCm: cartonH,
    volumeCm3: cartonVol,
    skuPackings: [packing],
    avgUtilization: packing.spaceUtilization,
  };
}
