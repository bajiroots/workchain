"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  FilePlus2,
  Handshake,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { useRecentActivity } from "@/lib/hooks/use-workchain";
import type { Activity } from "@/lib/contracts/types";

import { Card } from "./ui/card";
import { ErrorState, LoadingState } from "./ui/states";

const activityIcons: Record<Activity["kind"], typeof FilePlus2> = {
  created: FilePlus2,
  funded: CircleDollarSign,
  accepted: Handshake,
  submitted: Send,
  completed: BadgeCheck,
  refunded: RotateCcw,
  cancelled: XCircle,
};

export function RecentActivity() {
  const { data = [], isLoading, error } = useRecentActivity();

  if (isLoading) return <LoadingState label="Loading contract events..." />;
  if (error) return <ErrorState message="Could not load recent activity." />;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <h2 className="font-semibold">Recent activity</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Events read directly from the escrow contract
          </p>
        </div>
        <FileCheck2 className="size-5 text-zinc-600" />
      </div>
      {data.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-zinc-500">
          No contract activity yet.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {data.slice(0, 7).map((activity) => {
            const Icon = activityIcons[activity.kind];
            return (
              <Link
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-800/40"
                href={`/projects/${activity.projectId.toString()}`}
                key={activity.id}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-800 text-indigo-400">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-200">
                    {activity.title}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600">
                    Project #{activity.projectId.toString()} · Block{" "}
                    {activity.blockNumber.toString()}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

