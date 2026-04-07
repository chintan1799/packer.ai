"use client";

interface Props {
  nx: number; // units along length
  ny: number; // units along width
  nz: number; // units along height (layers)
  label: string; // e.g. "3 × 4 × 2"
}

/**
 * Isometric box grid diagram drawn with pure SVG.
 * Renders a visual representation of how units are stacked in a carton.
 */
export default function PackingGrid({ nx, ny, nz, label }: Props) {
  // Cap display to keep SVG manageable
  const dX = Math.min(nx, 4);
  const dY = Math.min(ny, 4);
  const dZ = Math.min(nz, 3);

  // Isometric projection constants
  const CW = 20; // cell width in isometric space
  const CH = 10; // cell height (half CW for true iso)
  const CD = 10; // cell depth (height of vertical face)

  // SVG viewBox sizing
  const svgW = (dX + dY) * CW + 10;
  const svgH = (dX + dY) * CH + dZ * CD + 10;

  // Convert grid coords to SVG screen coords (isometric)
  function toScreen(gx: number, gy: number, gz: number) {
    const sx = (gx - gy) * CW + svgW / 2;
    const sy = (gx + gy) * CH - gz * CD + svgH / 2 - CD * dZ / 2;
    return { x: sx, y: sy };
  }

  const cells: { gx: number; gy: number; gz: number }[] = [];
  // Render back to front for correct painter's algorithm
  for (let gz = 0; gz < dZ; gz++) {
    for (let gx = dX - 1; gx >= 0; gx--) {
      for (let gy = 0; gy < dY; gy++) {
        cells.push({ gx, gy, gz });
      }
    }
  }

  function isoBox(gx: number, gy: number, gz: number, key: string) {
    const tl = toScreen(gx, gy, gz + 1);
    const tr = toScreen(gx + 1, gy, gz + 1);
    const bl = toScreen(gx, gy + 1, gz + 1);
    const br = toScreen(gx + 1, gy + 1, gz + 1);
    const tlb = toScreen(gx, gy, gz);
    const trb = toScreen(gx + 1, gy, gz);
    const blb = toScreen(gx, gy + 1, gz);

    const top = `M ${tl.x},${tl.y} L ${tr.x},${tr.y} L ${br.x},${br.y} L ${bl.x},${bl.y} Z`;
    const left = `M ${tl.x},${tl.y} L ${bl.x},${bl.y} L ${blb.x},${blb.y} L ${tlb.x},${tlb.y} Z`;
    const right = `M ${tr.x},${tr.y} L ${br.x},${br.y} L ${blb.x + CW},${blb.y} L ${trb.x},${trb.y} Z`;

    return (
      <g key={key}>
        <path d={top} fill="#e0e7ff" stroke="#6366f1" strokeWidth="0.5" />
        <path d={left} fill="#c7d2fe" stroke="#6366f1" strokeWidth="0.5" />
        <path d={right} fill="#a5b4fc" stroke="#6366f1" strokeWidth="0.5" />
      </g>
    );
  }

  const isTruncated = nx > 4 || ny > 4 || nz > 3;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={Math.min(svgW * 2, 200)}
        height={Math.min(svgH * 2, 140)}
        className="overflow-visible"
        aria-label={`Packing grid: ${label}`}
      >
        {cells.map(({ gx, gy, gz }) =>
          isoBox(gx, gy, gz, `${gx}-${gy}-${gz}`)
        )}
      </svg>
      <div className="text-center">
        <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {label}
        </span>
        {isTruncated && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            (diagram shows first {dX}×{dY}×{dZ})
          </p>
        )}
      </div>
    </div>
  );
}
