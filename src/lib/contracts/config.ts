import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import { hardhat, sepolia } from "viem/chains";

import {
  workCertificateAbi,
  workChainEscrowAbi,
  workChainTokenAbi,
} from "./abi";

function publicAddress(value: string | undefined): Address {
  return value && isAddress(value) ? getAddress(value) : zeroAddress;
}

export const targetChainId =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) === sepolia.id
    ? sepolia.id
    : hardhat.id;

export const targetChain =
  targetChainId === sepolia.id ? sepolia : hardhat;

export const contractAddresses = {
  token: publicAddress(process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
  certificate: publicAddress(process.env.NEXT_PUBLIC_NFT_ADDRESS),
  escrow: publicAddress(process.env.NEXT_PUBLIC_ESCROW_ADDRESS),
} as const;

export const contracts = {
  token: {
    address: contractAddresses.token,
    abi: workChainTokenAbi,
    chainId: targetChainId,
  },
  certificate: {
    address: contractAddresses.certificate,
    abi: workCertificateAbi,
    chainId: targetChainId,
  },
  escrow: {
    address: contractAddresses.escrow,
    abi: workChainEscrowAbi,
    chainId: targetChainId,
  },
} as const;

export const contractsConfigured = Object.values(contractAddresses).every(
  (address) => address !== zeroAddress,
);

export const deploymentBlock = BigInt(
  process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK ?? "0",
);

