# WorkChain MVP Plan

## Goal

Build a small Web3 escrow MVP where:

1. A client creates and funds a project with WCT.
2. The designated freelancer accepts and submits proof of work.
3. The client approves the submission.
4. The escrow pays the freelancer and mints an NFT certificate.

The project intentionally excludes disputes, bidding, ratings, chat, KYC,
multi-token payments, backend services, and automated IPFS uploads.

## Milestones

### 1. Foundation

- Initialize one pnpm package containing Hardhat and Next.js.
- Configure TypeScript, local Hardhat, and Sepolia.
- Add environment documentation and the shared certificate artwork.

### 2. Smart Contracts

- Implement the WCT ERC-20 token.
- Implement the ERC-721 work certificate with on-chain metadata.
- Implement the escrow lifecycle and access controls.
- Add an Ignition deployment module.

### 3. Contract Verification

- Test deployment, lifecycle transitions, payment, certificate minting,
  metadata, refunds, cancellation, and unauthorized calls.
- Stop for review after compile and contract tests pass.

### 4. Frontend

- Build the landing page and dark dashboard shell.
- Add wallet connection and contract configuration.
- Build project list, creation, detail, and certificate pages.

### 5. Integration

- Connect all contract reads and writes with Wagmi and Viem.
- Derive recent activity from contract events.
- Add loading, empty, error, and transaction receipt states.

### 6. Final QA

- Run lint, contract tests, frontend tests, and production build.
- Exercise the complete local flow in the browser.
- Deploy to Sepolia and record addresses and deployment blocks.

## Repository Structure

```text
contracts/                 Solidity contracts
test/                      Hardhat contract tests
ignition/modules/          Deployment modules
deployments/               Deployment address manifests
public/assets/             Shared certificate artwork
src/app/                   Next.js App Router pages
src/components/            Shared UI components
src/lib/                   Web3 and contract helpers
scripts/                   Utility scripts
```

## Contract Design

### WorkChainToken

- Standard OpenZeppelin ERC-20.
- Name: `WorkChain Token`.
- Symbol: `WCT`.
- Mints the constructor-provided supply to the deployer.

### WorkCertificateNFT

- Standard transferable ERC-721 Enumerable.
- Only the escrow contract can mint.
- The escrow address is configured once and then contract ownership is
  renounced.
- Each token stores project ID, title, client, freelancer, amount, and
  completion timestamp.
- `tokenURI` returns Base64 JSON metadata.
- Every certificate references one immutable `ipfs://` artwork URI supplied
  during deployment.

### WorkChainEscrow

- Uses one immutable WCT payment token and one immutable certificate contract.
- Uses 1-based project IDs.
- Project states:
  `Created -> Funded -> Accepted -> Submitted -> Completed`.
- A client may cancel a `Created` project.
- A client may refund a `Funded` project before freelancer acceptance.
- Approval updates state, transfers WCT, and mints the NFT atomically.
- Uses `SafeERC20`, `ReentrancyGuard`, custom errors, and role checks.

## Frontend Pages

- `/`: product explanation and wallet connection.
- `/dashboard`: project totals, active escrow, and recent events.
- `/projects`: all projects with status filtering.
- `/projects/create`: create-project form.
- `/projects/[id]`: project data and role-aware actions.
- `/certificates`: certificates owned by the connected wallet.

## Data Flow

- Contract state is the source of truth.
- Project lists use `projectCount` plus batched `getProject` reads.
- Recent activity uses Viem event logs from the deployment block.
- Transactions wait for receipts before refreshing reads.
- NFT JSON metadata stays on-chain; only the shared image bytes live on IPFS.

## Testing Plan

- Token metadata, initial supply, and deployer balance.
- Project create, cancel, fund, accept, submit, approve, and refund.
- WCT escrow balances and freelancer payment.
- Certificate ownership, stored project data, Base64 metadata, and image URI.
- Required events and state transitions.
- Reverts for wrong roles, invalid inputs, invalid states, insufficient
  allowance, duplicate actions, and refund after acceptance.

## Risks and Assumptions

- There is no dispute or timeout once a freelancer accepts.
- WCT is a conventional ERC-20 without transfer fees.
- The shared Pinata CID must exist before a real deployment.
- Browser event queries are suitable for an MVP but not a high-volume chain.
- Sepolia is for demonstration only; production use requires an audit.

