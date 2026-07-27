import Link from "next/link";

export const metadata = {
  title: "Gymfit — Train the plan. Log what you did.",
  description: "Your real 4-day split, tracked properly — planned versus actual, every session.",
};

// Full-bleed cinematic landing. Self-contained dark styling (its own video ground) so it
// reads premium regardless of the app's light theme; `fixed inset-0` escapes the app's
// max-w-3xl content wrapper, and BottomNav hides itself on this route.
export default function WelcomePage() {
  return (
    <section className="fixed inset-0 z-40 overflow-hidden bg-[#0a0806] text-[#f4efe6]">
      {/* the signature: the gym is the whole stage */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/gymfit-hero-poster.jpg"
        style={{ filter: "brightness(1.32) contrast(1.05) saturate(1.08)" }}
      >
        <source src="/gymfit-hero-bg.mp4" type="video/mp4" />
      </video>

      {/* scrims: legibility ramp bottom-left + warm golden vignette echoing the window light */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.18) 38%, rgba(10,8,6,0) 62%), linear-gradient(0deg, rgba(10,8,6,0.85) 0%, rgba(10,8,6,0.08) 46%, rgba(10,8,6,0) 66%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen"
        style={{
          background:
            "radial-gradient(120% 90% at 88% 18%, rgba(255,193,7,0.16), transparent 55%)",
        }}
      />

      {/* content */}
      <div className="relative z-[2] flex h-full flex-col p-6 sm:p-10 lg:p-14">
        <header className="flex items-center justify-between">
          <div className="text-lg font-bold uppercase tracking-[0.14em] sm:text-xl">
            GYM<span className="text-accent-lime">FIT</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a7d6f]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" aria-hidden />
            Training OS
          </div>
        </header>

        <div className="mt-auto max-w-2xl">
          <p
            className="animate-[fadeIn_0.7s_ease_0.2s_both] font-mono text-[11px] uppercase tracking-[0.22em] text-accent-lime sm:text-xs"
          >
            Planned vs. actual — every session
          </p>
          <h1 className="mt-4 animate-[fadeIn_0.8s_ease_0.35s_both] text-5xl font-bold leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Train the plan.
            <br />
            <span className="text-accent-lime">Log</span> what you did.
          </h1>
          <p className="mt-5 max-w-md animate-[fadeIn_0.8s_ease_0.5s_both] text-[15px] leading-relaxed text-[#b8ab9c] sm:text-lg">
            Your real 4-day split, tracked properly. Not a checklist — a record of the gap
            between what you set out to do and what you actually put in.
          </p>

          {/* disciplined golden rule — echoes the app's session progress bars */}
          <div
            className="my-8 h-0.5 w-full max-w-md animate-[fadeIn_0.7s_ease_0.6s_both] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-lime) 0%, var(--accent-lime) 62%, rgba(255,193,7,0.12) 62%)",
            }}
          />

          <div className="flex animate-[fadeIn_0.8s_ease_0.7s_both] flex-wrap items-center gap-4">
            <Link
              href="/checkin"
              className="inline-flex items-center gap-2 rounded-full bg-accent-lime px-7 py-4 text-[15px] font-extrabold text-on-accent transition hover:brightness-110 sm:text-base"
            >
              Start training
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M4 10h11m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="border-b border-transparent py-4 text-[15px] font-semibold text-[#f4efe6] transition hover:border-[#f4efe6]/50 sm:text-base"
            >
              View dashboard
            </Link>
          </div>
        </div>

        {/* corner proof — the real system, not a fabricated metric */}
        <div className="pointer-events-none absolute bottom-6 right-6 hidden text-right sm:bottom-10 sm:right-10 sm:block">
          <div className="text-3xl font-bold leading-none text-accent-lime sm:text-5xl">4-day</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a7d6f]">
            Upper · Lower · Flow · Mixed
          </div>
        </div>
      </div>
    </section>
  );
}
