import {
  ProjectStatus,
  projectStatusLabels,
} from "@/lib/contracts/types";

const statusClasses: Record<ProjectStatus, string> = {
  [ProjectStatus.Created]: "border-zinc-700 bg-zinc-800 text-zinc-300",
  [ProjectStatus.Funded]: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  [ProjectStatus.Accepted]: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  [ProjectStatus.Submitted]:
    "border-violet-500/30 bg-violet-500/10 text-violet-300",
  [ProjectStatus.Completed]:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  [ProjectStatus.Refunded]: "border-zinc-600 bg-zinc-800 text-zinc-400",
  [ProjectStatus.Cancelled]: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {projectStatusLabels[status]}
    </span>
  );
}

