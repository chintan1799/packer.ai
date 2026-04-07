import type { OptimizerResult } from "@/lib/types";
import CartonCard from "./CartonCard";
import SummaryPanel from "./SummaryPanel";
import { Box } from "lucide-react";

interface Props {
  result: OptimizerResult;
  totalSKUs: number;
}

export default function ResultsSection({ result, totalSKUs }: Props) {
  if (result.cartons.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Box className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No valid cartons could be generated. Check your SKU dimensions.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {result.cartons.length} carton size
          {result.cartons.length !== 1 ? "s" : ""} recommended
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Each carton size below is compatible with the listed SKUs. One SKU type
          per physical carton.
        </p>
      </div>

      {/* Carton cards */}
      <div className="space-y-4">
        {result.cartons.map((carton) => (
          <CartonCard key={carton.id} carton={carton} />
        ))}
      </div>

      {/* Summary */}
      <SummaryPanel result={result} totalSKUs={totalSKUs} />
    </section>
  );
}
