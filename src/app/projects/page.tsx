"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
  ProjectStatus,
  projectStatusLabels,
} from "@/lib/contracts/types";
import { useProjects } from "@/lib/hooks/use-workchain";

type Filter = "all" | ProjectStatus;

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects();
  const [filter, setFilter] = useState<Filter>("all");

  const filteredProjects = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((project) => project.status === filter),
    [filter, projects],
  );

  return (
    <AppShell
      action={
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          href="/projects/create"
        >
          <Plus className="size-4" />
          Create project
        </Link>
      }
      description="Browse every project stored in the escrow contract and follow its current state."
      eyebrow="Escrow"
      title="Projects"
    >
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
            filter === "all"
              ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          All projects
        </button>
        {Object.values(ProjectStatus)
          .filter((value): value is ProjectStatus => typeof value === "number")
          .map((status) => (
            <button
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                filter === status
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
              key={status}
              onClick={() => setFilter(status)}
              type="button"
            >
              {projectStatusLabels[status]}
            </button>
          ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message="Could not read projects from the escrow contract." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="inline-flex min-h-11 items-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white"
              href="/projects/create"
            >
              Create the first project
            </Link>
          }
          description={
            filter === "all"
              ? "Create a project to define the freelancer, scope, and WCT escrow amount."
              : "No projects currently match this status."
          }
          title={filter === "all" ? "No projects yet" : "No matching projects"}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id.toString()} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

