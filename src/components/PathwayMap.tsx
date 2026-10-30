import { useId } from "react";

type Node = { label: string; sub?: string };

export function PathwayMap({ nodes, className = "" }: { nodes: Node[]; className?: string }) {
  const id = useId();
  const width = 880;
  const height = 220;
  const step = (width - 80) / (nodes.length - 1);
  const points = nodes.map((_, i) => {
    const x = 40 + i * step;
    const y = 110 + Math.sin(i * 1.2) * 26;
    return { x, y };
  });
  const path =
    points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(" ");

  return (
    <div className={"relative w-full overflow-x-auto " + className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px]" role="img" aria-label="Career pathway">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.38 0.16 275)" />
            <stop offset="60%" stopColor="oklch(0.55 0.18 275)" />
            <stop offset="100%" stopColor="oklch(0.62 0.15 160)" />
          </linearGradient>
        </defs>
        <path d={path} stroke="var(--pathway-line)" strokeWidth="3" fill="none" />
        <path d={path} stroke={`url(#grad-${id})`} strokeWidth="2.5" fill="none" className="pathway-dashed" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="10" fill="white" stroke={`url(#grad-${id})`} strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="4" fill="var(--milestone)" className={i === points.length - 1 ? "milestone-pulse" : undefined} />
            <text x={p.x} y={p.y - 22} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">{nodes[i].label}</text>
            {nodes[i].sub ? (
              <text x={p.x} y={p.y + 30} textAnchor="middle" className="fill-muted-foreground text-[10px]">{nodes[i].sub}</text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}