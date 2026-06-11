import {
  connectorsForWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

import { targetChainId } from "@/lib/contracts/config";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const chains = [hardhat, sepolia] as const;
const transports = {
  [hardhat.id]: http(
    process.env.NEXT_PUBLIC_LOCAL_RPC_URL ?? "http://127.0.0.1:8545",
  ),
  [sepolia.id]: http(rpcUrl),
};

export const wagmiConfig =
  targetChainId === hardhat.id || !walletConnectProjectId
    ? createConfig({
        chains,
        connectors: connectorsForWallets(
          [
            {
              groupName: "Browser wallet",
              wallets: [injectedWallet],
            },
          ],
          {
            appName: "WorkChain",
            projectId: "local-injected-wallet",
          },
        ),
        transports,
        ssr: true,
      })
    : getDefaultConfig({
        appName: "WorkChain",
        appDescription: "Freelance escrow and on-chain work certificates.",
        projectId: walletConnectProjectId,
        chains,
        transports,
        ssr: true,
      });
