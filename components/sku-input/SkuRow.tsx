"use client";

import { SKUInput } from "@/lib/types";
import SkuRowActions from "./SkuRowActions";

interface Props {
  sku: SKUInput;
  index: number;
  canDelete: boolean;
  onChange: (id: string, field: keyof SKUInput, value: string) => void;
  onDelete: (id: string) => void;
  onEnterOnLastField: () => void;
}

function isValidPositive(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && n > 0;
}

interface CellProps {
  value: string;
  placeholder: string;
  isValid: boolean;
  onChange: (v: string) => void;
  onEnter?: () => void;
  isLast?: boolean;
  isName?: boolean;
}

function Cell({
  value,
  placeholder,
  isValid,
  onChange,
  onEnter,
  isLast,
  isName,
}: CellProps) {
  const invalid = value !== "" && !isValid;

  return (
    <input
      type={isName ? "text" : "number"}
      min={isName ? undefined : "0.01"}
      step={isName ? undefined : "any"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && isLast && onEnter) onEnter();
      }}
      className={[
        "w-full px-2 py-1.5 text-sm rounded border bg-white outline-none transition-colors",
        "focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400",
        invalid
          ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
    />
  );
}

export default function SkuRow({
  sku,
  index,
  canDelete,
  onChange,
  onDelete,
  onEnterOnLastField,
}: Props) {
  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="px-3 py-2 text-xs text-slate-400 select-none w-8 text-center">
        {index + 1}
      </td>
      <td className="px-2 py-2 min-w-[140px]">
        <Cell
          value={sku.name}
          placeholder="e.g. Widget S"
          isValid={sku.name.trim().length > 0}
          onChange={(v) => onChange(sku.id, "name", v)}
          isName
        />
      </td>
      {(
        [
          { field: "lengthCm", placeholder: "30" },
          { field: "widthCm", placeholder: "20" },
          { field: "heightCm", placeholder: "15" },
          { field: "weightKg", placeholder: "0.5" },
        ] as { field: keyof SKUInput; placeholder: string }[]
      ).map(({ field, placeholder }, i, arr) => (
        <td key={field} className="px-2 py-2 w-28">
          <Cell
            value={sku[field] as string}
            placeholder={placeholder}
            isValid={isValidPositive(sku[field] as string)}
            onChange={(v) => onChange(sku.id, field, v)}
            isLast={i === arr.length - 1}
            onEnter={onEnterOnLastField}
          />
        </td>
      ))}
      <td className="px-2 py-2 w-10">
        <SkuRowActions
          canDelete={canDelete}
          onDelete={() => onDelete(sku.id)}
        />
      </td>
    </tr>
  );
}
