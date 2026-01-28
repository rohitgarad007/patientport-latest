import { cn } from "@/lib/utils";

type StatusType = "active" | "idle" | "offline" | "online" | "busy" | "waiting" | "current" | "follow-up" | "walk-in" | "appointment" | "emergency";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  online: {
    label: "Online",
    className: "bg-success/10 text-success border-success/20",
  },
  idle: {
    label: "Idle",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  busy: {
    label: "Busy",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  waiting: {
    label: "waiting",
    className: "bg-info/10 text-info border-info/20",
  },
  current: {
    label: "Current",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  offline: {
    label: "Offline",
    className: "bg-muted text-muted-foreground border-border",
  },
  "follow-up": {
    label: "follow-up",
    className: "bg-info/10 text-info border-info/20",
  },
  "walk-in": {
    label: "walk-in",
    className: "bg-accent/10 text-accent border-accent/20",
  },
  appointment: {
    label: "appointment",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  emergency: {
    label: "emergency",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
