import type { ReactNode } from "react";

import { ContractNotice } from "./ui/states";

export function AppShell({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            {description}
          </p>
        </div>
        {action}
      </div>
      <ContractNotice />
      {children}
    </main>
  );
}

