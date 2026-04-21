import { cn } from "@/lib/utils";
import type { Stage, Status } from "@/lib/mock-data";

const statusStyles: Record<Status, string> = {
  active: "bg-success/10 text-success border-success/20",
  at_risk: "bg-warning/15 text-warning-foreground border-warning/30",
  completed: "bg-muted text-muted-foreground border-border",
};

const statusLabel: Record<Status, string> = {
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", statusStyles[status])}>
      <span className={cn("size-1.5 rounded-full",
        status === "active" && "bg-success",
        status === "at_risk" && "bg-warning",
        status === "completed" && "bg-muted-foreground"
      )} />
      {statusLabel[status]}
    </span>
  );
}

const stageStyles: Record<Stage, string> = {
  planted: "bg-info/10 text-info border-info/20",
  growing: "bg-primary/10 text-primary border-primary/20",
  ready: "bg-accent text-accent-foreground border-accent-foreground/20",
  harvested: "bg-muted text-muted-foreground border-border",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border", stageStyles[stage])}>
      {stage}
    </span>
  );
}
