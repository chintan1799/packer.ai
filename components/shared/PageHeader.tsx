"use client";

import { Package } from "lucide-react";

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            packer<span className="text-indigo-600">.ai</span>
          </span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">
          Carton Size Optimizer
        </span>
      </div>
    </header>
  );
}
