import clsx from "clsx";

export function Badge({
  label,
  achieved,
  icon,
}: {
  label: string;
  achieved: boolean;
  icon: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-1 rounded-xl border p-3 text-center",
        achieved
          ? "border-accent-green/40 bg-surface-2"
          : "border-border bg-surface opacity-40"
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[11px] leading-tight text-muted">{label}</span>
    </div>
  );
}
