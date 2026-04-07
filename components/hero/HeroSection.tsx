import { ArrowDown, BarChart3, Box, Layers } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-16 sm:py-24 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/60 via-white to-white pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-6">
          <Box className="w-3 h-3" />
          Free · No sign-up required
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight text-balance mb-4">
          Stop guessing{" "}
          <span className="text-indigo-600">carton sizes</span>
        </h1>

        <p className="text-lg text-slate-500 text-balance max-w-2xl mx-auto mb-8">
          Enter your SKU dimensions and get standardized outer carton
          recommendations with exact packing layouts — designed for real
          warehouse execution, not perfect math.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: Layers, label: "3–6 carton sizes" },
            { icon: BarChart3, label: "75–85% utilization target" },
            { icon: Box, label: "Grid-based layouts" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 shadow-sm px-3 py-1.5 text-sm text-slate-600"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-500" />
              {label}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-slate-300 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
