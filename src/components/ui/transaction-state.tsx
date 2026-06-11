import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import type { Hash } from "viem";

export function TransactionState({
  message,
  error,
  hash,
}: {
  message: string;
  error: string;
  hash?: Hash;
}) {
  if (!message && !error) return null;

  if (error) {
    return (
      <div className="mt-4 flex gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {error}
      </div>
    );
  }

  const complete = message === "Transaction confirmed.";

  return (
    <div
      className={`mt-4 flex gap-3 rounded-xl border p-3 text-sm ${
        complete
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          : "border-indigo-500/25 bg-indigo-500/10 text-indigo-200"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin" />
      )}
      <span>
        {message}
        {hash ? (
          <span className="mt-1 block font-mono text-[11px] opacity-60">
            {hash.slice(0, 14)}...{hash.slice(-8)}
          </span>
        ) : null}
      </span>
    </div>
  );
}

