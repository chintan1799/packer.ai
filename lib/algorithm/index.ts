import type { SKU, SKUInput, OptimizerResult } from "../types";
import { clusterByVolume } from "./clustering";
import { proposeCartonsFromClusters, deduplicateAndFinalize } from "./cartonSizing";
import { UTIL_MARGINAL } from "./constants";

function enrichSKU(input: SKUInput): SKU | null {
  const l = parseFloat(input.lengthCm);
  const w = parseFloat(input.widthCm);
  const h = parseFloat(input.heightCm);
  const wt = parseFloat(input.weightKg);

  if ([l, w, h, wt].some((v) => isNaN(v) || v <= 0)) return null;
  if (!input.name.trim()) return null;

  return {
    id: input.id,
    name: input.name.trim(),
    lengthCm: l,
    widthCm: w,
    heightCm: h,
    weightKg: wt,
    volumeCm3: l * w * h,
  };
}

export function runPackingOptimizer(inputs: SKUInput[]): OptimizerResult {
  // Parse and validate
  const skus: SKU[] = [];
  for (const input of inputs) {
    const sku = enrichSKU(input);
    if (sku) skus.push(sku);
  }

  if (skus.length === 0) {
    return {
      cartons: [],
      uncoveredSKUs: [],
      coveragePercent: 0,
      computedAt: new Date(),
    };
  }

  // Step 1: Cluster
  const clusters = clusterByVolume(skus);

  // Step 2–4: Propose cartons from clusters, check multi-SKU compatibility
  const rawCartons = proposeCartonsFromClusters(clusters, skus);

  // Step 5: Deduplicate, sort, label
  const finalCartons = deduplicateAndFinalize(rawCartons, skus);

  // Determine which SKUs are uncovered (no carton fits them at >= UTIL_MARGINAL)
  const coveredIds = new Set(
    finalCartons.flatMap((c) => c.skuPackings.map((p) => p.sku.id))
  );
  const uncoveredSKUs = skus.filter((s) => !coveredIds.has(s.id));
  const coveragePercent =
    skus.length > 0
      ? Math.round(((skus.length - uncoveredSKUs.length) / skus.length) * 100)
      : 0;

  return {
    cartons: finalCartons,
    uncoveredSKUs,
    coveragePercent,
    computedAt: new Date(),
  };
}
