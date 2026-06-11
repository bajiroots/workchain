import { formatUnits, getAddress, type Address } from "viem";

export function formatAddress(address: Address | string) {
  const value = getAddress(address);
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function formatWct(value: bigint, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(Number(formatUnits(value, 18)));
}

export function formatDate(timestamp: bigint) {
  if (timestamp === 0n) return "Not completed";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Number(timestamp) * 1000));
}

export function ipfsToGateway(uri: string) {
  if (!uri.startsWith("ipfs://") || uri.includes("replace-with-pinata-cid")) {
    return "/assets/workchain-certificate.png";
  }

  return `https://gateway.pinata.cloud/ipfs/${uri.slice("ipfs://".length)}`;
}

export function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction failed. Please try again.";

  const message = error.message;

  if (message.includes("User rejected") || message.includes("User denied")) {
    return "Transaction was rejected in your wallet.";
  }
  if (message.includes("OnlyClient")) return "Only the project client can do this.";
  if (message.includes("OnlyFreelancer")) {
    return "Only the assigned freelancer can do this.";
  }
  if (message.includes("InvalidStatus")) {
    return "This action is not available for the current project status.";
  }
  if (message.includes("ERC20InsufficientAllowance")) {
    return "Approve enough WCT before funding this project.";
  }
  if (message.includes("ERC20InsufficientBalance")) {
    return "Your wallet does not have enough WCT.";
  }

  return "The transaction could not be completed.";
}

