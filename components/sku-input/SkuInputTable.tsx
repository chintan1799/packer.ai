"use client";

import { Plus, FlaskConical } from "lucide-react";
import { SKUInput } from "@/lib/types";
import SkuRow from "./SkuRow";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

const EXAMPLE_SKUS: Omit<SKUInput, "id">[] = [
  { name: "Widget Small", lengthCm: "12", widthCm: "8", heightCm: "5", weightKg: "0.3" },
  { name: "Gadget Medium", lengthCm: "22", widthCm: "15", heightCm: "10", weightKg: "0.8" },
  { name: "Box Large", lengthCm: "40", widthCm: "30", heightCm: "20", weightKg: "2.5" },
  { name: "Mini Pouch", lengthCm: "10", widthCm: "6", heightCm: "3", weightKg: "0.15" },
  { name: "Tablet Pack", lengthCm: "28", widthCm: "20", heightCm: "8", weightKg: "1.2" },
];

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

interface Props {
  skus: SKUInput[];
  onChange: (skus: SKUInput[]) => void;
}

export default function SkuInputTable({ skus, onChange }: Props) {
  function handleChange(id: string, field: keyof SKUInput, value: string) {
    onChange(skus.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function handleDelete(id: string) {
    if (skus.length <= 1) return;
    onChange(skus.filter((s) => s.id !== id));
  }

  function handleAdd() {
    onChange([...skus, emptyRow()]);
  }

  function handleLoadExample() {
    onChange(EXAMPLE_SKUS.map((s) => ({ ...s, id: newId() })));
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Your SKUs{" "}
          <span className="font-normal text-slate-400">({skus.length})</span>
        </h2>
        <button
          onClick={handleLoadExample}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline underline-offset-2 transition-colors"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Load example
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-400 w-8">#</th>
              <th className="px-2 py-2.5 text-left text-xs font-medium text-slate-500">
                SKU Name
              </th>
              <th className="px-2 py-2.5 text-left text-xs font-medium text-slate-500">
                Length (cm)
              </th>
              <th className="px-2 py-2.5 text-left text-xs font-medium text-slate-500">
                Width (cm)
              </th>
              <th className="px-2 py-2.5 text-left text-xs font-medium text-slate-500">
                Height (cm)
              </th>
              <th className="px-2 py-2.5 text-left text-xs font-medium text-slate-500">
                Weight (kg)
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {skus.map((sku, index) => (
              <SkuRow
                key={sku.id}
                sku={sku}
                index={index}
                canDelete={skus.length > 1}
                onChange={handleChange}
                onDelete={handleDelete}
                onEnterOnLastField={handleAdd}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAdd}
        className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors group"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors">
          <Plus className="w-3 h-3" />
        </span>
        Add SKU
      </button>
    </div>
  );
}
