import { UTIL_GOOD, UTIL_MARGINAL } from "@/lib/algorithm/constants";
import { formatUtilization } from "@/lib/utils";

interface Props {
  utilization: number; // 0–100
}

function colorClass(util: number): string {
  if (util >= UTIL_GOOD) return "bg-emerald-500";
  if (util >= UTIL_MARGINAL) return "bg-amber-400";
  return "bg-red-400";
}

function textColorClass(util: number): string {
  if (util >= UTIL_GOOD) return "text-emerald-700";
  if (util >= UTIL_MARGINAL) return "text-amber-700";
  return "text-red-600";
}

export default function UtilizationBar({ utilization }: Props) {
  const pct = Math.min(100, Math.max(0, utilization));

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold tabular-nums w-9 text-right ${textColorClass(pct)}`}
      >
        {formatUtilization(pct)}
      </span>
    </div>
  );
}
