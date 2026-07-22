import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-accent-lime">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
        <p className="text-sm text-muted">This page doesn&apos;t exist or has been moved.</p>
      </div>

      <Link
        href="/"
        className="rounded-xl bg-accent-lime px-6 py-3 font-bold text-on-accent transition hover:brightness-110"
      >
        Go back home
      </Link>
    </div>
  );
}
