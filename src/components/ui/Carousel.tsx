"use client";

import { useRef, type ReactNode, type TouchEvent } from "react";
import clsx from "clsx";

export function Carousel({
  children,
  index,
  onIndexChange,
}: {
  children: ReactNode[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const count = children.length;
  const clampedIndex = Math.min(Math.max(index, 0), Math.max(count - 1, 0));

  const go = (dir: 1 | -1) => onIndexChange((clampedIndex + dir + count) % count);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (count === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${clampedIndex * 100}%)` }}
        >
          {children.map((child, i) => (
            <div key={i} className="w-full shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous day"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-muted shadow-md backdrop-blur transition hover:text-foreground"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next day"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-muted shadow-md backdrop-blur transition hover:text-foreground"
          >
            ›
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {children.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Go to day ${i + 1}`}
                className={clsx(
                  "h-1.5 rounded-full transition-all",
                  i === clampedIndex ? "w-5 bg-accent-lime" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
