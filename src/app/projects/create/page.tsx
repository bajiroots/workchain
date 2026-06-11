"use client";

import { ArrowLeft, CircleDollarSign, FileText, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isAddress, parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { TransactionState } from "@/components/ui/transaction-state";
import { WalletButton } from "@/components/wallet-button";
import {
  contracts,
  contractsConfigured,
  targetChainId,
} from "@/lib/contracts/config";
import { useTokenData, useWorkChainTransaction } from "@/lib/hooks/use-workchain";
import { formatWct } from "@/lib/format";
import { workChainPublicClient } from "@/lib/web3/public-client";

export default function CreateProjectPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: tokenData } = useTokenData(address);
  const transaction = useWorkChainTransaction();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    transaction.reset();

    if (!address) return;
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    if (!isAddress(freelancer)) {
      setFormError("Enter a valid freelancer wallet address.");
      return;
    }
    if (freelancer.toLowerCase() === address.toLowerCase()) {
      setFormError("Client and freelancer must use different wallets.");
      return;
    }

    let parsedAmount: bigint;
    try {
      parsedAmount = parseUnits(amount, 18);
      if (parsedAmount <= 0n) throw new Error("Invalid amount");
    } catch {
      setFormError("Enter a valid WCT amount greater than zero.");
      return;
    }

    try {
      await transaction.execute(
        {
          ...contracts.escrow,
          functionName: "createProject",
          args: [
            title.trim(),
            description.trim(),
            freelancer,
            parsedAmount,
          ],
        },
        "Confirm project creation in your wallet...",
      );

      const projectCount = await workChainPublicClient.readContract({
        ...contracts.escrow,
        functionName: "projectCount",
      });
      router.push(`/projects/${projectCount.toString()}`);
    } catch {
      // The transaction hook exposes the user-facing error.
    }
  }

  return (
    <AppShell
      action={
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
          href="/projects"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
      }
      description="Define the work, assign one freelancer, and set the WCT amount that will be locked after funding."
      eyebrow="New escrow"
      title="Create a project"
    >
      {!isConnected ? (
        <EmptyState
          action={<WalletButton />}
          description="Connect the wallet that will act as the project client."
          title="Connect your client wallet"
        />
      ) : chainId !== targetChainId ? (
        <EmptyState
          action={<WalletButton />}
          description="Switch your wallet to the network configured for this WorkChain deployment."
          title="Switch network"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              <div>
                <label className="label" htmlFor="title">
                  Project title
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-zinc-600" />
                  <input
                    className="input pl-10"
                    id="title"
                    maxLength={120}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Design and build a product landing page"
                    value={title}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="label" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="input min-h-36 resize-y"
                  id="description"
                  maxLength={1200}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the scope, expected deliverables, and acceptance criteria."
                  value={description}
                />
              </div>

              <div className="mt-6">
                <label className="label" htmlFor="freelancer">
                  Freelancer address
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-zinc-600" />
                  <input
                    autoCapitalize="off"
                    autoComplete="off"
                    className="input pl-10 font-mono text-sm"
                    id="freelancer"
                    onChange={(event) => setFreelancer(event.target.value)}
                    placeholder="0x..."
                    spellCheck={false}
                    value={freelancer}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="label" htmlFor="amount">
                  Escrow amount
                </label>
                <div className="relative">
                  <CircleDollarSign className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-zinc-600" />
                  <input
                    className="input pl-10 pr-16"
                    id="amount"
                    inputMode="decimal"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="250"
                    value={amount}
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-indigo-400">
                    WCT
                  </span>
                </div>
              </div>

              {formError ? (
                <p className="mt-4 text-sm text-red-300">{formError}</p>
              ) : null}
              <TransactionState
                error={transaction.error}
                hash={transaction.hash}
                message={transaction.message}
              />

              <Button
                className="mt-7 w-full"
                disabled={transaction.isPending || !contractsConfigured}
                type="submit"
              >
                {transaction.isPending ? "Creating project..." : "Create project"}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-sm font-semibold">Wallet balance</p>
              <p className="mt-3 text-3xl font-semibold">
                {formatWct(tokenData?.balance ?? 0n)}
                <span className="ml-2 text-sm text-indigo-400">WCT</span>
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Creating is free apart from gas. WCT is transferred only when
                you fund the project.
              </p>
            </Card>
            <Card className="p-5 text-sm leading-6 text-zinc-400">
              <p className="font-semibold text-zinc-200">What happens next?</p>
              <ol className="mt-3 space-y-2">
                <li>1. Approve the exact WCT allowance.</li>
                <li>2. Fund the project escrow.</li>
                <li>3. The assigned freelancer can accept.</li>
              </ol>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
