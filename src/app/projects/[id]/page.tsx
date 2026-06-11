"use client";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleDollarSign,
  Copy,
  ExternalLink,
  FileCheck2,
  Handshake,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useAccount, useChainId } from "wagmi";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { TransactionState } from "@/components/ui/transaction-state";
import { WalletButton } from "@/components/wallet-button";
import {
  contracts,
  contractsConfigured,
  targetChainId,
} from "@/lib/contracts/config";
import { ProjectStatus } from "@/lib/contracts/types";
import {
  formatAddress,
  formatDate,
  formatWct,
} from "@/lib/format";
import {
  useProject,
  useTokenData,
  useWorkChainTransaction,
} from "@/lib/hooks/use-workchain";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = useMemo(() => {
    try {
      const value = BigInt(params.id);
      return value > 0n ? value : undefined;
    } catch {
      return undefined;
    }
  }, [params.id]);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: project, isLoading, error } = useProject(projectId);
  const { data: tokenData } = useTokenData(address);
  const transaction = useWorkChainTransaction();
  const [proofUrl, setProofUrl] = useState("");
  const [copied, setCopied] = useState("");

  const isClient =
    Boolean(address && project) &&
    address?.toLowerCase() === project?.client.toLowerCase();
  const isFreelancer =
    Boolean(address && project) &&
    address?.toLowerCase() === project?.freelancer.toLowerCase();
  const correctNetwork = chainId === targetChainId;

  function runAction(
    request: Parameters<typeof transaction.execute>[0],
    message: string,
  ) {
    transaction.reset();
    void transaction.execute(request, message).catch(() => undefined);
  }

  function submitProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project || !proofUrl.trim()) return;

    runAction(
      {
        ...contracts.escrow,
        functionName: "submitWork",
        args: [project.id, proofUrl.trim()],
      },
      "Confirm work submission in your wallet...",
    );
  }

  async function copyAddress(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  if (!projectId) {
    return (
      <AppShell
        description="The project identifier in this URL is invalid."
        title="Project not found"
      >
        <EmptyState
          description="Return to the project list and choose an existing project."
          title="Invalid project ID"
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      action={
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
          href="/projects"
        >
          <ArrowLeft className="size-4" />
          All projects
        </Link>
      }
      description={
        project
          ? `Project #${project.id.toString()} · Created ${formatDate(project.createdAt)}`
          : "Read project state and complete the next available escrow action."
      }
      eyebrow="Project detail"
      title={project?.title ?? "Loading project"}
    >
      {isLoading ? (
        <LoadingState />
      ) : error || !project ? (
        <ErrorState message="This project could not be read from the contract." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={project.status} />
                <span className="text-xs text-zinc-600">
                  On-chain project #{project.id.toString()}
                </span>
              </div>
              <h2 className="mt-7 text-sm font-semibold text-zinc-300">
                Project scope
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-zinc-400">
                {project.description}
              </p>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="font-semibold">Participants</h2>
              </div>
              {[
                {
                  label: "Client",
                  address: project.client,
                  icon: ShieldCheck,
                },
                {
                  label: "Freelancer",
                  address: project.freelancer,
                  icon: UserRound,
                },
              ].map(({ label, address: participant, icon: Icon }) => (
                <div
                  className="flex items-center gap-4 border-b border-zinc-800 px-6 py-5 last:border-0"
                  key={label}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-zinc-800 text-zinc-400">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="mt-1 truncate font-mono text-sm text-zinc-200">
                      {participant}
                    </p>
                  </div>
                  <button
                    aria-label={`Copy ${label} address`}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                    onClick={() => void copyAddress(label, participant)}
                    type="button"
                  >
                    {copied === label ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              ))}
            </Card>

            {project.proofUrl ? (
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                    <FileCheck2 className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Submitted proof of work</p>
                    <a
                      className="mt-2 flex items-center gap-2 break-all text-sm text-indigo-300 hover:text-indigo-200"
                      href={project.proofUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {project.proofUrl}
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          <aside className="space-y-4">
            <Card className="p-6">
              <p className="text-sm text-zinc-500">Escrow amount</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                {formatWct(project.amount)}
                <span className="ml-2 text-base text-indigo-400">WCT</span>
              </p>
              <div className="mt-5 grid gap-3 border-t border-zinc-800 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Client</span>
                  <span>{formatAddress(project.client)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Freelancer</span>
                  <span>{formatAddress(project.freelancer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Completed</span>
                  <span>{formatDate(project.completedAt)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold">Available action</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Actions are enabled by your wallet role and the current
                contract state.
              </p>

              {!isConnected ? (
                <div className="mt-5">
                  <WalletButton />
                </div>
              ) : !correctNetwork ? (
                <div className="mt-5">
                  <WalletButton />
                </div>
              ) : project.status === ProjectStatus.Created && isClient ? (
                <div className="mt-5 space-y-3">
                  {(tokenData?.allowance ?? 0n) < project.amount ? (
                    <Button
                      className="w-full"
                      disabled={transaction.isPending || !contractsConfigured}
                      onClick={() =>
                        runAction(
                          {
                            ...contracts.token,
                            functionName: "approve",
                            args: [contracts.escrow.address, project.amount],
                          },
                          "Approve WCT spending in your wallet...",
                        )
                      }
                    >
                      <CircleDollarSign className="size-4" />
                      Approve {formatWct(project.amount)} WCT
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={transaction.isPending || !contractsConfigured}
                      onClick={() =>
                        runAction(
                          {
                            ...contracts.escrow,
                            functionName: "fundProject",
                            args: [project.id],
                          },
                          "Fund the project escrow in your wallet...",
                        )
                      }
                    >
                      <ShieldCheck className="size-4" />
                      Fund project
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    disabled={transaction.isPending}
                    onClick={() =>
                      runAction(
                        {
                          ...contracts.escrow,
                          functionName: "cancelProject",
                          args: [project.id],
                        },
                        "Confirm project cancellation...",
                      )
                    }
                    variant="ghost"
                  >
                    <XCircle className="size-4" />
                    Cancel project
                  </Button>
                  <p className="text-xs leading-5 text-zinc-600">
                    Wallet balance: {formatWct(tokenData?.balance ?? 0n)} WCT
                  </p>
                </div>
              ) : project.status === ProjectStatus.Funded && isFreelancer ? (
                <Button
                  className="mt-5 w-full"
                  disabled={transaction.isPending}
                  onClick={() =>
                    runAction(
                      {
                        ...contracts.escrow,
                        functionName: "acceptProject",
                        args: [project.id],
                      },
                      "Accept this project in your wallet...",
                    )
                  }
                >
                  <Handshake className="size-4" />
                  Accept project
                </Button>
              ) : project.status === ProjectStatus.Funded && isClient ? (
                <Button
                  className="mt-5 w-full"
                  disabled={transaction.isPending}
                  onClick={() =>
                    runAction(
                      {
                        ...contracts.escrow,
                        functionName: "refundProject",
                        args: [project.id],
                      },
                      "Confirm escrow refund...",
                    )
                  }
                  variant="danger"
                >
                  <RotateCcw className="size-4" />
                  Refund escrow
                </Button>
              ) : project.status === ProjectStatus.Accepted && isFreelancer ? (
                <form className="mt-5" onSubmit={submitProof}>
                  <label className="label" htmlFor="proofUrl">
                    Proof URL
                  </label>
                  <input
                    className="input"
                    id="proofUrl"
                    onChange={(event) => setProofUrl(event.target.value)}
                    placeholder="https://github.com/... or https://..."
                    type="url"
                    value={proofUrl}
                  />
                  <Button
                    className="mt-3 w-full"
                    disabled={transaction.isPending || !proofUrl.trim()}
                    type="submit"
                  >
                    <Send className="size-4" />
                    Submit work
                  </Button>
                </form>
              ) : project.status === ProjectStatus.Submitted && isClient ? (
                <Button
                  className="mt-5 w-full"
                  disabled={transaction.isPending}
                  onClick={() =>
                    runAction(
                      {
                        ...contracts.escrow,
                        functionName: "approveWork",
                        args: [project.id],
                      },
                      "Approve work and release payment...",
                    )
                  }
                >
                  <BadgeCheck className="size-4" />
                  Approve and pay
                </Button>
              ) : project.status === ProjectStatus.Completed ? (
                <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <BadgeCheck className="size-4" />
                    Project complete
                  </div>
                  <p className="mt-2 leading-5 text-emerald-200/70">
                    Payment was released and certificate #{project.id.toString()}{" "}
                    was minted.
                  </p>
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-zinc-950 p-4 text-sm leading-6 text-zinc-500">
                  No action is available for this wallet at the current stage.
                </p>
              )}

              <TransactionState
                error={transaction.error}
                hash={transaction.hash}
                message={transaction.message}
              />
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="size-4 text-zinc-500" />
                <span className="text-zinc-500">Created</span>
                <span className="ml-auto">{formatDate(project.createdAt)}</span>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

