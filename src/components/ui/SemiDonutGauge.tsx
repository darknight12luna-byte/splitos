const ARC_PATH = "M 20 100 A 80 80 0 0 1 180 100";

export function SemiDonutGauge({
  pct,
  centerLabel,
  subLabel,
  color,
}: {
  pct: number;
  centerLabel: string;
  subLabel: string;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="112" viewBox="0 0 200 112" className="w-full max-w-[220px]">
        <path
          d={ARC_PATH}
          fill="none"
          stroke="var(--border)"
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
        />
        <path
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - clamped}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="-mt-9 text-center">
        <p className="text-2xl font-bold" style={{ color }}>
          {centerLabel}
        </p>
        <p className="text-xs text-muted">{subLabel}</p>
      </div>
    </div>
  );
}
