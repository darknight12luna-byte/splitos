import { ReactNode, CSSProperties } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/10",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
