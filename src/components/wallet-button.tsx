"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";

import { formatAddress } from "@/lib/format";

import { Button } from "./ui/button";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <Button onClick={openConnectModal}>
              <Wallet className="size-4" />
              Connect wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button variant="danger" onClick={openChainModal}>
              Wrong network
            </Button>
          );
        }

        return (
          <button
            className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
            onClick={openAccountModal}
            type="button"
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            {formatAddress(account.address)}
            <ChevronDown className="size-4 text-zinc-500" />
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

