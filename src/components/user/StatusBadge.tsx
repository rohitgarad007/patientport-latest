import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertCircle, Phone } from "lucide-react";

export type AppointmentStatus = 
  | "scheduled" 
  | "approaching" 
  | "allowed_to_arrive" 
  | "now_serving" 
  | "completed" 
  | "cancelled" 
  | "no_show";

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-info-light text-info border-info/20",
  },
  approaching: {
    label: "Approaching",
    icon: AlertCircle,
    className: "bg-warning-light text-warning border-warning/20 animate-pulse-glow",
  },
  allowed_to_arrive: {
    label: "Ready to Arrive",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
  now_serving: {
    label: "Now Being Called",
    icon: Phone,
    className: "bg-primary text-primary-foreground border-primary animate-pulse-glow",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-success-light text-success border-success/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-destructive-light text-destructive border-destructive/20",
  },
  no_show: {
    label: "No Show",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-border",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all",
        config.className,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
};
