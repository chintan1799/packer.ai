import type {
  SKU,
  SKUCluster,
  CartonRecommendation,
  ClusterLabel,
} from "../types";
import { proposeSeedCarton, bestPackingForSKUInCarton } from "./packingEngine";
import { UTIL_MIN_COMPAT } from "./constants";

const CLUSTER_LABEL_ORDER: ClusterLabel[] = ["Small", "Medium", "Large"];

function cartonLabel(index: number): string {
  return `Carton ${String.fromCharCode(65 + index)}`; // A, B, C…
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
  const skuPackings = [];

  for (const sku of allSKUs) {
    const packing = bestPackingForSKUInCarton(sku, l, w, h);
    if (packing && packing.spaceUtilization >= UTIL_MIN_COMPAT) {
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
    label: "", // set after dedup + sorting
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
    // Try each SKU in the cluster as representative; pick best candidate
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

      // Score by: avg utilization + coverage (how many SKUs it fits)
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

  // Sort dims for comparison so 60×40×30 == 40×60×30
  const dimsA = [a.lengthCm, a.widthCm, a.heightCm].sort((x, y) => x - y);
  const dimsB = [b.lengthCm, b.widthCm, b.heightCm].sort((x, y) => x - y);

  return (
    withinPct(dimsA[0], dimsB[0]) &&
    withinPct(dimsA[1], dimsB[1]) &&
    withinPct(dimsA[2], dimsB[2])
  );
}

/**
 * Merge near-identical cartons, cap at 6, assign labels, sort by volume.
 */
export function deduplicateAndFinalize(
  cartons: CartonRecommendation[],
  allSKUs: SKU[]
): CartonRecommendation[] {
  const merged: CartonRecommendation[] = [];

  for (const carton of cartons) {
    const existing = merged.find((m) => nearlyEqual(m, carton));
    if (existing) {
      // Keep the one with higher avg utilization
      if (carton.avgUtilization > existing.avgUtilization) {
        const idx = merged.indexOf(existing);
        merged[idx] = carton;
      }
    } else {
      merged.push(carton);
    }
  }

  // Sort by cluster label order, then by volume
  const sorted = merged
    .sort((a, b) => {
      const ai = CLUSTER_LABEL_ORDER.indexOf(a.clusterLabel);
      const bi = CLUSTER_LABEL_ORDER.indexOf(b.clusterLabel);
      if (ai !== bi) return ai - bi;
      return a.volumeCm3 - b.volumeCm3;
    })
    .slice(0, 6);

  // Assign final labels
  return sorted.map((c, i) => ({ ...c, label: cartonLabel(i) }));
}
