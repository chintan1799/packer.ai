"use client";

import { useCallback, useRef, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import HeroSection from "@/components/hero/HeroSection";
import SkuInputTable from "@/components/sku-input/SkuInputTable";
import OptimizeButton from "@/components/shared/OptimizeButton";
import ResultsSection from "@/components/results/ResultsSection";
import { runPackingOptimizer } from "@/lib/algorithm";
import type { SKUInput, OptimizerResult } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyRow(): SKUInput {
  return {
    id: newId(),
    name: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    weightKg: "",
  };
}

const INITIAL_ROWS: SKUInput[] = [emptyRow(), emptyRow(), emptyRow()];

export default function HomePage() {
  const [skus, setSkus] = useState<SKUInput[]>(INITIAL_ROWS);
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleOptimize = useCallback(() => {
    setIsComputing(true);
    // Defer so React renders the loading state before the synchronous algo runs
    setTimeout(() => {
      try {
        const optimizerResult = runPackingOptimizer(skus);
        setResult(optimizerResult);
      } finally {
        setIsComputing(false);
        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }
    }, 60);
  }, [skus]);

  const validSkuCount = skus.filter(
    (s) =>
      s.name.trim() &&
      parseFloat(s.lengthCm) > 0 &&
      parseFloat(s.widthCm) > 0 &&
      parseFloat(s.heightCm) > 0 &&
      parseFloat(s.weightKg) > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection />

        {/* Input section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <SkuInputTable skus={skus} onChange={setSkus} />

          <OptimizeButton
            onClick={handleOptimize}
            loading={isComputing}
            disabled={validSkuCount === 0}
          />

          {validSkuCount === 0 && !isComputing && (
            <p className="text-center text-xs text-slate-400 mt-3">
              Fill in at least one complete SKU row to optimize
            </p>
          )}
          {validSkuCount > 0 && !isComputing && (
            <p className="text-center text-xs text-slate-400 mt-3">
              {validSkuCount} valid SKU{validSkuCount !== 1 ? "s" : ""} ready to optimize
            </p>
          )}
        </section>

        {/* Results section */}
        {result && (
          <div ref={resultsRef} className="mt-10 scroll-mt-20">
            <ResultsSection result={result} totalSKUs={validSkuCount} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        packer.ai — Carton Size Optimizer &middot; All computation runs in your browser
      </footer>
    </div>
  );
}
