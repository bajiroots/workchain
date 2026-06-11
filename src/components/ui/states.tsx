import { AlertCircle, LoaderCircle, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

import { contractsConfigured } from "@/lib/contracts/config";

import { Card } from "./card";

export function LoadingState({ label = "Loading on-chain data..." }) {
  return (
    <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-zinc-400">
      <LoaderCircle className="size-5 animate-spin text-indigo-400" />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <WalletCards className="size-6 text-indigo-400" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function ContractNotice() {
  if (contractsConfigured) return null;

  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />
      <div>
        <p className="font-semibold">Contracts are not configured yet</p>
        <p className="mt-1 text-amber-200/70">
          Deploy WorkChain and add the three addresses to{" "}
          <code className="rounded bg-black/20 px-1.5 py-0.5">.env.local</code>.
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-red-300">
      <AlertCircle className="size-5" />
      {message}
    </div>
  );
}

