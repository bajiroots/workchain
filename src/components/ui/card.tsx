import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/75 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

