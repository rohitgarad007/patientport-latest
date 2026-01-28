import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "success" | "warning" | "info";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "primary",
  className 
}: StatCardProps) {
  const gradientClasses = {
    primary: "stat-card-primary",
    success: "stat-card-success",
    warning: "stat-card-warning",
    info: "stat-card-info",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 text-primary-foreground",
        gradientClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-foreground/80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 flex items-center gap-1",
              trend.isPositive ? "text-success-foreground" : "text-destructive-foreground"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-primary-foreground/70">vs last week</span>
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-foreground/10 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary-foreground/5" />
    </div>
  );
}
