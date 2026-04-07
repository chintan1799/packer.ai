import type { OptimizerResult } from "@/lib/types";
import { AlertTriangle, CheckCircle2, LayoutGrid, Package } from "lucide-react";

interface Props {
  result: OptimizerResult;
  totalSKUs: number;
}

export default function SummaryPanel({ result, totalSKUs }: Props) {
  const { cartons, uncoveredSKUs, coveragePercent } = result;
  const allCovered = uncoveredSKUs.length === 0;

  // Most efficient carton
  const topCarton =
    cartons.length > 0
      ? cartons.reduce((best, c) =>
          c.avgUtilization > best.avgUtilization ? c : best
        )
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm">Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <Stat
          icon={<LayoutGrid className="w-4 h-4 text-indigo-500" />}
          label="Carton sizes"
          value={cartons.length.toString()}
        />
        <Stat
          icon={<Package className="w-4 h-4 text-indigo-500" />}
          label="SKUs covered"
          value={`${totalSKUs - uncoveredSKUs.length} / ${totalSKUs}`}
        />
        <Stat
          icon={
            allCovered ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )
          }
          label="Coverage"
          value={`${coveragePercent}%`}
          valueClass={allCovered ? "text-emerald-700" : "text-amber-700"}
        />
        <Stat
          icon={<Package className="w-4 h-4 text-indigo-500" />}
          label="Best utilization"
          value={
            topCarton
              ? `${topCarton.avgUtilization}% (${topCarton.label})`
              : "—"
          }
        />
      </div>

      {uncoveredSKUs.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <span className="font-semibold">Heads up:</span> The following SKUs
          didn&apos;t fit any proposed carton at a comfortable utilization —
          consider custom sizing:{" "}
          <span className="font-medium">
            {uncoveredSKUs.map((s) => s.name).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass = "text-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p className={`text-lg font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
