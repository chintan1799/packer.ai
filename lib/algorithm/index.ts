import type { SKU, SKUInput, OptimizerResult } from "../types";
import { clusterByVolume } from "./clustering";
import {
  proposeCartonsFromClusters,
  deduplicateAndFinalize,
  buildCustomCarton,
  cartonLabel,
} from "./cartonSizing";

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

  // Step 2–4: Propose cartons from clusters + multi-SKU compatibility
  const rawCartons = proposeCartonsFromClusters(clusters, skus);

  // Step 5: Deduplicate and sort (no hard cap — custom cartons added next)
  const standardCartons = deduplicateAndFinalize(rawCartons);

  // Step 6: Guarantee 100% coverage — build custom cartons for any SKU that
  // didn't make it into a standard carton at the compatibility threshold.
  const coveredIds = new Set(
    standardCartons.flatMap((c) => c.skuPackings.map((p) => p.sku.id))
  );
  const stillUncovered = skus.filter((s) => !coveredIds.has(s.id));

  const customCartons = stillUncovered.map((sku, i) =>
    buildCustomCarton(sku, standardCartons.length + i)
  );

  // Combine and re-label everything sequentially (A, B, C…)
  const finalCartons = [...standardCartons, ...customCartons].map((c, i) => ({
    ...c,
    label: cartonLabel(i),
  }));

  // After the custom carton pass, every SKU is covered by definition.
  // uncoveredSKUs will always be empty, but we compute it anyway for the UI.
  const allCoveredIds = new Set(
    finalCartons.flatMap((c) => c.skuPackings.map((p) => p.sku.id))
  );
  const uncoveredSKUs = skus.filter((s) => !allCoveredIds.has(s.id));
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
