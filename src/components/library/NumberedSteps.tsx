export function NumberedSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return <p className="italic text-muted">Not documented in your source yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-lime text-xs font-bold text-on-accent">
            {i + 1}
          </span>
          <p className="text-sm leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}
