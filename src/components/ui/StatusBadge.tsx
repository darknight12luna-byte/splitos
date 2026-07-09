import clsx from "clsx";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Not Started", className: "border-border text-muted" },
  IN_PROGRESS: { label: "In Progress", className: "border-accent-blue text-accent-blue" },
  COMPLETED: { label: "Completed", className: "border-accent-lime text-accent-lime" },
  PARTIAL: { label: "Partial", className: "border-accent-orange text-accent-orange" },
  SKIPPED: { label: "Skipped", className: "border-accent-red text-accent-red" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_STARTED;
  return (
    <span
      className={clsx(
        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
