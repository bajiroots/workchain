# WorkChain

WorkChain is a small Web3 freelance escrow MVP. Clients lock WCT in a smart
contract, freelancers submit proof of work, and approval releases payment while
minting an ERC-721 work certificate.

## Stack

- Hardhat 3, Solidity, OpenZeppelin, and Ignition
- Next.js App Router, TypeScript, and Tailwind CSS
- Wagmi, Viem, and RainbowKit
- Pinata-hosted shared certificate artwork

## Local Setup

Install dependencies and compile contracts:

```bash
pnpm install
pnpm compile
pnpm export:abis
```

Start a persistent Hardhat node:

```bash
pnpm node:local
```

In a second terminal, deploy, write `.env.local`, and add demo projects:

```bash
pnpm deploy:localhost
pnpm seed:localhost
pnpm dev
```

Import one of the private keys printed by Hardhat into a browser wallet and add
the local network at `http://127.0.0.1:8545` with chain ID `31337`.

## Sepolia Deployment

1. Upload `public/assets/workchain-certificate.png` to Pinata.
2. Set the Sepolia RPC URL, a dedicated testnet deployer private key, and
   `CERTIFICATE_IMAGE_URI=ipfs://<CID>` in `.env`.
3. Run `pnpm deploy:sepolia`.
4. The command writes the public Sepolia contract configuration to `.env.local`.
5. Run `pnpm dev` to use Sepolia from `http://localhost:3000`.

Example `.env`:

```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SEPOLIA_PRIVATE_KEY=0x...
CERTIFICATE_IMAGE_URI=ipfs://...
```

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is optional. Without it, the local
frontend uses an injected browser wallet such as MetaMask.

## Checks

```bash
pnpm test:contracts
pnpm lint
pnpm build
```
