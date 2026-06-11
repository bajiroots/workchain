import { createPublicClient, http } from "viem";

import { targetChain, targetChainId } from "@/lib/contracts/config";

const rpcUrl =
  targetChainId === 31337
    ? process.env.NEXT_PUBLIC_LOCAL_RPC_URL ?? "http://127.0.0.1:8545"
    : process.env.NEXT_PUBLIC_RPC_URL;

export const workChainPublicClient = createPublicClient({
  chain: targetChain,
  transport: http(rpcUrl),
});

