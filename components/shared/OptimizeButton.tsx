"use client";

import { Loader2, Sparkles } from "lucide-react";

interface Props {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function OptimizeButton({ onClick, loading, disabled }: Props) {
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className={[
          "inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white text-sm",
          "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
          "shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200",
          "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimizing…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Optimize Carton Sizes
          </>
        )}
      </button>
    </div>
  );
}
