import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import Link from "next/link";

import type { Project } from "@/lib/contracts/types";
import { formatAddress, formatDate, formatWct } from "@/lib/format";

import { Card } from "../ui/card";
import { StatusBadge } from "../ui/status-badge";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group p-5 transition hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <StatusBadge status={project.status} />
        <span className="text-xs text-zinc-600">#{project.id.toString()}</span>
      </div>
      <h2 className="mt-5 line-clamp-1 text-lg font-semibold tracking-tight">
        {project.title}
      </h2>
      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-400">
        {project.description}
      </p>
      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="text-xs text-zinc-500">Escrow amount</p>
        <p className="mt-1 text-xl font-semibold">
          {formatWct(project.amount)}{" "}
          <span className="text-sm font-medium text-indigo-400">WCT</span>
        </p>
      </div>
      <div className="mt-5 grid gap-2 text-xs text-zinc-500">
        <span className="flex items-center gap-2">
          <UserRound className="size-3.5" />
          Freelancer {formatAddress(project.freelancer)}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays className="size-3.5" />
          Created {formatDate(project.createdAt)}
        </span>
      </div>
      <Link
        className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm font-semibold text-zinc-300 transition group-hover:text-indigo-300"
        href={`/projects/${project.id.toString()}`}
      >
        View project
        <ArrowUpRight className="size-4" />
      </Link>
    </Card>
  );
}

