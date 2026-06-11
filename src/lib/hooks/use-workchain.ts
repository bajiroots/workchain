"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  parseAbiItem,
  type Address,
  type Hash,
} from "viem";
import { useWriteContract } from "wagmi";

import {
  contracts,
  contractsConfigured,
  deploymentBlock,
} from "@/lib/contracts/config";
import type {
  Activity,
  Certificate,
  Project,
} from "@/lib/contracts/types";
import { friendlyError } from "@/lib/format";
import { workChainPublicClient } from "@/lib/web3/public-client";

type WriteRequest = Parameters<
  ReturnType<typeof useWriteContract>["writeContractAsync"]
>[0];

export function useProjects() {
  return useQuery({
    queryKey: ["workchain", "projects", contracts.escrow.address],
    enabled: contractsConfigured,
    queryFn: async () => {
      const count = await workChainPublicClient.readContract({
        ...contracts.escrow,
        functionName: "projectCount",
      });

      const projectIds = Array.from(
        { length: Number(count) },
        (_, index) => BigInt(index + 1),
      );

      return Promise.all(
        projectIds.map(async (projectId) => {
          const project = await workChainPublicClient.readContract({
            ...contracts.escrow,
            functionName: "getProject",
            args: [projectId],
          });
          return project as Project;
        }),
      );
    },
    refetchInterval: 12_000,
  });
}

export function useProject(projectId: bigint | undefined) {
  return useQuery({
    queryKey: [
      "workchain",
      "project",
      contracts.escrow.address,
      projectId?.toString(),
    ],
    enabled: Boolean(contractsConfigured && projectId),
    queryFn: async () => {
      if (!projectId) return null;

      const project = await workChainPublicClient.readContract({
        ...contracts.escrow,
        functionName: "getProject",
        args: [projectId],
      });
      return project as Project;
    },
    refetchInterval: 8_000,
  });
}

export function useTokenData(address: Address | undefined) {
  return useQuery({
    queryKey: ["workchain", "token-data", address],
    enabled: Boolean(contractsConfigured && address),
    queryFn: async () => {
      if (!address) return null;

      const [balance, allowance] = await Promise.all([
        workChainPublicClient.readContract({
          ...contracts.token,
          functionName: "balanceOf",
          args: [address],
        }),
        workChainPublicClient.readContract({
          ...contracts.token,
          functionName: "allowance",
          args: [address, contracts.escrow.address],
        }),
      ]);

      return { balance, allowance };
    },
    refetchInterval: 8_000,
  });
}

export function useCertificates(owner: Address | undefined) {
  return useQuery({
    queryKey: ["workchain", "certificates", owner],
    enabled: Boolean(contractsConfigured && owner),
    queryFn: async () => {
      if (!owner) return [] satisfies Certificate[];

      const [balance, imageURI] = await Promise.all([
        workChainPublicClient.readContract({
          ...contracts.certificate,
          functionName: "balanceOf",
          args: [owner],
        }),
        workChainPublicClient.readContract({
          ...contracts.certificate,
          functionName: "imageURI",
        }),
      ]);

      const tokenIds = await Promise.all(
        Array.from({ length: Number(balance) }, (_, index) =>
          workChainPublicClient.readContract({
            ...contracts.certificate,
            functionName: "tokenOfOwnerByIndex",
            args: [owner, BigInt(index)],
          }),
        ),
      );

      return Promise.all(
        tokenIds.map(async (tokenId) => {
          const certificate = await workChainPublicClient.readContract({
            ...contracts.certificate,
            functionName: "getCertificate",
            args: [tokenId],
          });

          return {
            tokenId,
            imageURI,
            ...certificate,
          } as Certificate;
        }),
      );
    },
    refetchInterval: 12_000,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["workchain", "activity", contracts.escrow.address],
    enabled: contractsConfigured,
    queryFn: async () => {
      const [
        created,
        funded,
        accepted,
        submitted,
        completed,
        refunded,
        cancelled,
      ] = await Promise.all([
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 amount, string title)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectFunded(uint256 indexed projectId, uint256 amount)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectAccepted(uint256 indexed projectId, address indexed freelancer)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event WorkSubmitted(uint256 indexed projectId, string proofUrl)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectCompleted(uint256 indexed projectId, address indexed freelancer, uint256 amount)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectRefunded(uint256 indexed projectId, address indexed client, uint256 amount)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
        workChainPublicClient.getLogs({
          address: contracts.escrow.address,
          event: parseAbiItem(
            "event ProjectCancelled(uint256 indexed projectId, address indexed client)",
          ),
          fromBlock: deploymentBlock,
          strict: true,
        }),
      ]);

      const activities: Activity[] = [
        ...created.map((log) => ({
          id: `${log.transactionHash}-created`,
          projectId: log.args.projectId,
          kind: "created" as const,
          title: `Project "${log.args.title}" created`,
          blockNumber: log.blockNumber,
        })),
        ...funded.map((log) => ({
          id: `${log.transactionHash}-funded`,
          projectId: log.args.projectId,
          kind: "funded" as const,
          title: "Project funded with WCT",
          blockNumber: log.blockNumber,
        })),
        ...accepted.map((log) => ({
          id: `${log.transactionHash}-accepted`,
          projectId: log.args.projectId,
          kind: "accepted" as const,
          title: "Freelancer accepted the project",
          blockNumber: log.blockNumber,
        })),
        ...submitted.map((log) => ({
          id: `${log.transactionHash}-submitted`,
          projectId: log.args.projectId,
          kind: "submitted" as const,
          title: "Proof of work submitted",
          blockNumber: log.blockNumber,
        })),
        ...completed.map((log) => ({
          id: `${log.transactionHash}-completed`,
          projectId: log.args.projectId,
          kind: "completed" as const,
          title: "Payment released and certificate minted",
          blockNumber: log.blockNumber,
        })),
        ...refunded.map((log) => ({
          id: `${log.transactionHash}-refunded`,
          projectId: log.args.projectId,
          kind: "refunded" as const,
          title: "Escrow refunded to client",
          blockNumber: log.blockNumber,
        })),
        ...cancelled.map((log) => ({
          id: `${log.transactionHash}-cancelled`,
          projectId: log.args.projectId,
          kind: "cancelled" as const,
          title: "Unfunded project cancelled",
          blockNumber: log.blockNumber,
        })),
      ];

      return activities
        .sort((a, b) => Number(b.blockNumber - a.blockNumber))
        .slice(0, 12);
    },
    refetchInterval: 12_000,
  });
}

export function useWorkChainTransaction() {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState<Hash>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (request: WriteRequest, pendingMessage: string) => {
      setError("");
      setMessage(pendingMessage);
      setIsPending(true);

      try {
        const transactionHash = await writeContractAsync(request);
        setHash(transactionHash);
        setMessage("Waiting for on-chain confirmation...");
        await workChainPublicClient.waitForTransactionReceipt({
          hash: transactionHash,
        });
        setMessage("Transaction confirmed.");
        await queryClient.invalidateQueries({ queryKey: ["workchain"] });
        return transactionHash;
      } catch (transactionError) {
        setError(friendlyError(transactionError));
        setMessage("");
        throw transactionError;
      } finally {
        setIsPending(false);
      }
    },
    [queryClient, writeContractAsync],
  );

  const reset = useCallback(() => {
    setHash(undefined);
    setMessage("");
    setError("");
  }, []);

  return { execute, hash, message, error, isPending, reset };
}
