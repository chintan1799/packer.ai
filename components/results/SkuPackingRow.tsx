import type { SKUPackingResult } from "@/lib/types";
import { UTIL_GOOD, UTIL_MARGINAL } from "@/lib/algorithm/constants";
import { formatWeight } from "@/lib/utils";

interface Props {
  packing: SKUPackingResult;
}

function utilBadgeClass(util: number): string {
  if (util >= UTIL_GOOD)
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (util >= UTIL_MARGINAL)
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-600 border-red-200";
}

export default function SkuPackingRow({ packing }: Props) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="px-3 py-2.5 text-sm font-medium text-slate-800 max-w-[160px] truncate" title={packing.sku.name}>
        {packing.sku.name}
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="text-sm font-bold text-indigo-700 tabular-nums">
          {packing.unitsPerCarton}
        </span>
        <span className="text-xs text-slate-400 ml-1">units</span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
          {packing.layoutLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span
          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border tabular-nums ${utilBadgeClass(
            packing.spaceUtilization
          )}`}
        >
          {packing.spaceUtilization}%
        </span>
      </td>
      <td className="px-3 py-2.5 text-right text-xs text-slate-400 tabular-nums">
        {formatWeight(packing.totalCartonWeightKg)}
      </td>
    </tr>
  );
}
