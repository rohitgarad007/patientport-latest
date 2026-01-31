import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
}

export const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const variantClasses = {
    default: "bg-card",
    primary: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    accent: "bg-accent/10",
  };

  const iconClasses = {
    default: "text-muted-foreground bg-muted",
    primary: "text-primary bg-primary/20",
    success: "text-success bg-success/20",
    warning: "text-warning bg-warning/20",
    accent: "text-accent bg-accent/20",
  };

  return (
    <div className={`p-5 rounded-xl shadow-md ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-success mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconClasses[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
