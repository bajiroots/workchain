import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const addressesPath = resolve(
  root,
  "ignition/deployments/chain-31337/deployed_addresses.json",
);
const addresses = JSON.parse(await readFile(addressesPath, "utf8"));

const token = addresses["WorkChainModule#WorkChainToken"];
const certificate = addresses["WorkChainModule#WorkCertificateNFT"];
const escrow = addresses["WorkChainModule#WorkChainEscrow"];

if (!token || !certificate || !escrow) {
  throw new Error("WorkChain deployment addresses are incomplete.");
}

const environment = `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=workchain-local-demo
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_TOKEN_ADDRESS=${token}
NEXT_PUBLIC_NFT_ADDRESS=${certificate}
NEXT_PUBLIC_ESCROW_ADDRESS=${escrow}
NEXT_PUBLIC_DEPLOYMENT_BLOCK=0
`;

await writeFile(resolve(root, ".env.local"), environment);

console.log("Wrote local contract addresses to .env.local");

