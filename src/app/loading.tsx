export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-accent-lime" />
      <p className="text-xs text-muted">Loading…</p>
    </div>
  );
}
