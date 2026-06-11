"use client";

import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { RecentActivity } from "@/components/recent-activity";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import {
  isActiveProject,
  ProjectStatus,
} from "@/lib/contracts/types";
import { formatWct } from "@/lib/format";
import { useProjects } from "@/lib/hooks/use-workchain";

export default function DashboardPage() {
  const { data: projects = [], isLoading, error } = useProjects();

  const active = projects.filter((project) =>
    isActiveProject(project.status),
  );
  const completed = projects.filter(
    (project) => project.status === ProjectStatus.Completed,
  );
  const escrowValue = active.reduce(
    (total, project) => total + project.amount,
    0n,
  );

  return (
    <AppShell
      description="A live view of projects, escrowed value, completed work, and contract activity."
      eyebrow="Overview"
      title="Work dashboard"
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message="Could not read dashboard data from the contract." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total projects",
                value: projects.length.toString(),
                icon: BriefcaseBusiness,
                accent: "text-indigo-400",
              },
              {
                label: "Active projects",
                value: active.length.toString(),
                icon: Activity,
                accent: "text-blue-400",
              },
              {
                label: "Completed",
                value: completed.length.toString(),
                icon: BadgeCheck,
                accent: "text-emerald-400",
              },
              {
                label: "Active escrow",
                value: `${formatWct(escrowValue)} WCT`,
                icon: CircleDollarSign,
                accent: "text-amber-400",
              },
            ].map(({ label, value, icon: Icon, accent }) => (
              <Card className="p-5" key={label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <Icon className={`size-5 ${accent}`} />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight">
                  {value}
                </p>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <RecentActivity />
            <Card className="p-5">
              <h2 className="font-semibold">Project distribution</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Current status across all on-chain projects
              </p>
              <div className="mt-6 space-y-5">
                {[
                  {
                    label: "Active",
                    count: active.length,
                    color: "bg-indigo-500",
                  },
                  {
                    label: "Completed",
                    count: completed.length,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Drafts",
                    count: projects.filter(
                      (project) => project.status === ProjectStatus.Created,
                    ).length,
                    color: "bg-zinc-500",
                  },
                ].map(({ label, count, color }) => {
                  const width =
                    projects.length === 0
                      ? 0
                      : Math.round((count / projects.length) * 100);
                  return (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-400">{label}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        </>
      )}
    </AppShell>
  );
}

