import type { CartonRecommendation, ClusterLabel } from "@/lib/types";
import UtilizationBar from "./UtilizationBar";
import PackingGrid from "./PackingGrid";
import SkuPackingRow from "./SkuPackingRow";
import { formatDimensions } from "@/lib/utils";

interface Props {
  carton: CartonRecommendation;
}

const CLUSTER_COLORS: Record<ClusterLabel, string> = {
  Small: "border-blue-400",
  Medium: "border-violet-400",
  Large: "border-orange-400",
};

const CLUSTER_BG: Record<ClusterLabel, string> = {
  Small: "bg-blue-50 text-blue-700 border-blue-200",
  Medium: "bg-violet-50 text-violet-700 border-violet-200",
  Large: "bg-orange-50 text-orange-700 border-orange-200",
};

const LABEL_COLORS: Record<string, string> = {
  "Carton A": "bg-indigo-600",
  "Carton B": "bg-violet-600",
  "Carton C": "bg-sky-600",
  "Carton D": "bg-teal-600",
  "Carton E": "bg-rose-600",
  "Carton F": "bg-amber-600",
};

function getLabelColor(label: string): string {
  return LABEL_COLORS[label] ?? "bg-slate-600";
}

export default function CartonCard({ carton }: Props) {
  // Pick a representative packing for the diagram (highest utilization)
  const repPacking = carton.skuPackings.reduce((best, p) =>
    p.spaceUtilization > best.spaceUtilization ? p : best
  , carton.skuPackings[0]);

  return (
    <div
      className={`relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden border-l-4 ${CLUSTER_COLORS[carton.clusterLabel]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white text-sm font-bold shrink-0 ${getLabelColor(carton.label)}`}
          >
            {carton.label.replace("Carton ", "")}
          </span>
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight">
              {carton.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDimensions(carton.lengthCm, carton.widthCm, carton.heightCm)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CLUSTER_BG[carton.clusterLabel]}`}
        >
          {carton.clusterLabel}
        </span>
      </div>

      {/* Utilization bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Avg space utilization</span>
        </div>
        <UtilizationBar utilization={carton.avgUtilization} />
      </div>

      <div className="border-t border-slate-100" />

      {/* Two-column: table + grid diagram */}
      <div className="flex flex-col lg:flex-row gap-0">
        {/* SKU packing table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">SKU</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Units/Carton</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Layout</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Utilization</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Full Weight</th>
              </tr>
            </thead>
            <tbody>
              {carton.skuPackings.map((p) => (
                <SkuPackingRow key={p.sku.id} packing={p} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Isometric diagram */}
        {repPacking && (
          <div className="lg:border-l border-t lg:border-t-0 border-slate-100 flex items-center justify-center p-5 bg-slate-50/50 lg:w-52 shrink-0">
            <PackingGrid
              nx={repPacking.unitsAlongL}
              ny={repPacking.unitsAlongW}
              nz={repPacking.unitsAlongH}
              label={repPacking.layoutLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
