import type { SKU, SKUCluster, ClusterLabel } from "../types";

/**
 * Groups SKUs into 1–3 volume-based clusters (Small / Medium / Large).
 * Uses ratio-gap detection so the clustering is scale-invariant.
 */
export function clusterByVolume(skus: SKU[]): SKUCluster[] {
  if (skus.length === 0) return [];

  const sorted = [...skus].sort((a, b) => a.volumeCm3 - b.volumeCm3);

  if (sorted.length === 1) {
    return [{ label: "Small", skus: sorted }];
  }

  // Compute ratio gaps between adjacent volumes
  const gaps: Array<{ index: number; ratio: number }> = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const ratio = sorted[i + 1].volumeCm3 / sorted[i].volumeCm3;
    gaps.push({ index: i, ratio });
  }

  // Sort gaps descending by ratio
  const sortedGaps = [...gaps].sort((a, b) => b.ratio - a.ratio);

  // Only split if the gap ratio is significant (> 2.5×)
  const significantGaps = sortedGaps.filter((g) => g.ratio > 2.5);

  if (significantGaps.length === 0) {
    // All SKUs in one cluster
    return [{ label: "Small", skus: sorted }];
  }

  if (significantGaps.length === 1) {
    // Two clusters
    const splitAt = significantGaps[0].index + 1;
    return [
      { label: "Small", skus: sorted.slice(0, splitAt) },
      { label: "Large", skus: sorted.slice(splitAt) },
    ];
  }

  // Three clusters — use top-2 gaps
  const top2 = significantGaps.slice(0, 2).sort((a, b) => a.index - b.index);
  const split1 = top2[0].index + 1;
  const split2 = top2[1].index + 1;

  const clusterA = sorted.slice(0, split1);
  const clusterB = sorted.slice(split1, split2);
  const clusterC = sorted.slice(split2);

  const labels: ClusterLabel[] = ["Small", "Medium", "Large"];
  const result: SKUCluster[] = [];

  const groups = [clusterA, clusterB, clusterC];
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].length > 0) {
      result.push({ label: labels[i], skus: groups[i] });
    }
  }

  return result;
}
