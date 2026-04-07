export interface SKU {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  volumeCm3: number;
}

export interface SKUInput {
  id: string;
  name: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  weightKg: string;
}

export type ClusterLabel = "Small" | "Medium" | "Large";

export interface SKUCluster {
  label: ClusterLabel;
  skus: SKU[];
}

export interface Orientation {
  l: number;
  w: number;
  h: number;
}

export interface Grid {
  x: number;
  y: number;
  z: number;
}

export interface SKUPackingResult {
  sku: SKU;
  orientation: Orientation;
  unitsAlongL: number;
  unitsAlongW: number;
  unitsAlongH: number;
  unitsPerCarton: number;
  layoutLabel: string;
  spaceUtilization: number;
  totalCartonWeightKg: number;
}

export interface CartonRecommendation {
  id: string;
  label: string;
  clusterLabel: ClusterLabel;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumeCm3: number;
  skuPackings: SKUPackingResult[];
  avgUtilization: number;
}

export interface OptimizerResult {
  cartons: CartonRecommendation[];
  uncoveredSKUs: SKU[];
  coveragePercent: number;
  computedAt: Date;
}
