export interface ActivityRing {
  pct: number;
  color: string;
  label: string;
  value: string;
}

/** Concentric activity rings (Apple Watch style) — rings[0] is outermost. */
export function ActivityRings({ rings, size = 120 }: { rings: ActivityRing[]; size?: number }) {
  const strokeWidth = 11;
  const gap = 2.5;
  const outerRadius = size / 2 - strokeWidth / 2 - 1;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
        {rings.map((ring, i) => {
          const radius = outerRadius - i * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.max(0, Math.min(100, ring.pct));
          const offset = circumference - (clamped / 100) * circumference;
          const center = size / 2;
          return (
            <g key={ring.label}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--border)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col gap-2.5">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: ring.color }}
              aria-hidden
            />
            <div className="leading-tight">
              <p className="text-sm font-bold" style={{ color: ring.color }}>
                {ring.value}
              </p>
              <p className="text-[11px] text-muted">{ring.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
