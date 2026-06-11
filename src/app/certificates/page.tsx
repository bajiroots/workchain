"use client";

import { BadgeCheck, CalendarDays, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import { useAccount } from "wagmi";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/states";
import { WalletButton } from "@/components/wallet-button";
import {
  formatAddress,
  formatDate,
  formatWct,
  ipfsToGateway,
} from "@/lib/format";
import { useCertificates } from "@/lib/hooks/use-workchain";

export default function CertificatesPage() {
  const { address, isConnected } = useAccount();
  const { data: certificates = [], isLoading, error } =
    useCertificates(address);

  return (
    <AppShell
      description="NFT certificates currently owned by your connected wallet, backed by immutable on-chain project data."
      eyebrow="Reputation"
      title="Work certificates"
    >
      {!isConnected ? (
        <EmptyState
          action={<WalletButton />}
          description="Connect a freelancer wallet to load its WorkChain certificate NFTs."
          title="Connect your wallet"
        />
      ) : isLoading ? (
        <LoadingState label="Loading your certificates..." />
      ) : error ? (
        <ErrorState message="Could not read certificates from the NFT contract." />
      ) : certificates.length === 0 ? (
        <EmptyState
          description="A certificate is minted automatically when a client approves submitted work."
          title="No certificates yet"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <Card
              className="overflow-hidden"
              key={certificate.tokenId.toString()}
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-950">
                <Image
                  alt={`WorkChain certificate for ${certificate.title}`}
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={ipfsToGateway(certificate.imageURI)}
                  unoptimized
                />
                <span className="absolute right-4 top-4 rounded-full border border-emerald-400/20 bg-black/65 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur">
                  Verified on-chain
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Certificate #{certificate.tokenId.toString()}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {certificate.title}
                    </h2>
                  </div>
                  <BadgeCheck className="size-5 shrink-0 text-indigo-400" />
                </div>
                <div className="mt-5 space-y-3 border-t border-zinc-800 pt-5 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CircleDollarSign className="size-4 text-zinc-600" />
                    {formatWct(certificate.amount)} WCT
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CalendarDays className="size-4 text-zinc-600" />
                    {formatDate(certificate.completedAt)}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Client</span>
                    <span className="font-mono text-zinc-400">
                      {formatAddress(certificate.client)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Freelancer</span>
                    <span className="font-mono text-zinc-400">
                      {formatAddress(certificate.freelancer)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

