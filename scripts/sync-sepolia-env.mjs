import "dotenv/config";

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const deploymentDirectory = resolve(
  root,
  "ignition/deployments/chain-11155111",
);

const addresses = JSON.parse(
  await readFile(resolve(deploymentDirectory, "deployed_addresses.json"), "utf8"),
);
const journal = await readFile(
  resolve(deploymentDirectory, "journal.jsonl"),
  "utf8",
);

const token = addresses["WorkChainModule#WorkChainToken"];
const certificate = addresses["WorkChainModule#WorkCertificateNFT"];
const escrow = addresses["WorkChainModule#WorkChainEscrow"];

if (!token || !certificate || !escrow) {
  throw new Error("WorkChain Sepolia deployment addresses are incomplete.");
}

const deploymentBlocks = journal
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line))
  .filter(
    (entry) =>
      entry.type === "TRANSACTION_CONFIRM" &&
      typeof entry.receipt?.blockNumber === "number",
  )
  .map((entry) => entry.receipt.blockNumber);

if (deploymentBlocks.length === 0) {
  throw new Error("Could not determine the Sepolia deployment block.");
}

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ?? process.env.SEPOLIA_RPC_URL;

if (!rpcUrl) {
  throw new Error(
    "Set NEXT_PUBLIC_RPC_URL or SEPOLIA_RPC_URL in .env before syncing Sepolia.",
  );
}

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const environment = `${walletConnectProjectId ? `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${walletConnectProjectId}\n` : ""}NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=${rpcUrl}
NEXT_PUBLIC_TOKEN_ADDRESS=${token}
NEXT_PUBLIC_NFT_ADDRESS=${certificate}
NEXT_PUBLIC_ESCROW_ADDRESS=${escrow}
NEXT_PUBLIC_DEPLOYMENT_BLOCK=${Math.min(...deploymentBlocks)}
`;

await writeFile(resolve(root, ".env.local"), environment);

console.log("Configured the local frontend to use WorkChain on Sepolia.");
console.log("Token:", token);
console.log("Certificate:", certificate);
console.log("Escrow:", escrow);

