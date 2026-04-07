"use client";

import { Trash2 } from "lucide-react";

interface Props {
  onDelete: () => void;
  canDelete: boolean;
}

export default function SkuRowActions({ onDelete, canDelete }: Props) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="Delete row"
        className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
