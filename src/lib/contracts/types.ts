import type { Address } from "viem";

export enum ProjectStatus {
  Created,
  Funded,
  Accepted,
  Submitted,
  Completed,
  Refunded,
  Cancelled,
}

export interface Project {
  id: bigint;
  client: Address;
  freelancer: Address;
  amount: bigint;
  title: string;
  description: string;
  proofUrl: string;
  createdAt: bigint;
  completedAt: bigint;
  status: ProjectStatus;
}

export interface Certificate {
  tokenId: bigint;
  projectId: bigint;
  title: string;
  client: Address;
  freelancer: Address;
  amount: bigint;
  completedAt: bigint;
  imageURI: string;
}

export interface Activity {
  id: string;
  projectId: bigint;
  kind:
    | "created"
    | "funded"
    | "accepted"
    | "submitted"
    | "completed"
    | "refunded"
    | "cancelled";
  title: string;
  blockNumber: bigint;
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.Created]: "Created",
  [ProjectStatus.Funded]: "Funded",
  [ProjectStatus.Accepted]: "Accepted",
  [ProjectStatus.Submitted]: "Submitted",
  [ProjectStatus.Completed]: "Completed",
  [ProjectStatus.Refunded]: "Refunded",
  [ProjectStatus.Cancelled]: "Cancelled",
};

export function isActiveProject(status: ProjectStatus) {
  return [
    ProjectStatus.Funded,
    ProjectStatus.Accepted,
    ProjectStatus.Submitted,
  ].includes(status);
}

