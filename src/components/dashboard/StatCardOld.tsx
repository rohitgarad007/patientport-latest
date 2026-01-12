import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  // ✅ icon can be a Lucide icon OR an image path
  icon?: LucideIcon | string;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "pink"
    | "purple"
    | "blue"
    | "teal";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  change,
  icon,
  variant = "default",
  className,
}: StatsCardProps) {
  // ✅ Card background variants
  const variants = {
    default: "bg-white border border-border",
    success: "bg-green-50 border border-green-200",
    warning: "bg-orange-50 border border-orange-200",
    danger: "bg-red-50 border border-red-200",
    pink: "bg-pink-50 border border-pink-200",
    purple: "bg-purple-50 border border-purple-200",
    blue: "bg-blue-50 border border-blue-200",
    teal: "bg-teal-50 border border-teal-200",
  };

  // ✅ Icon / Image background variants
  const iconVariants = {
    default: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-100",
    warning: "text-orange-600 bg-orange-100",
    danger: "text-red-600 bg-red-100",
    pink: "text-pink-600 bg-pink-100",
    purple: "text-purple-600 bg-purple-100",
    blue: "text-blue-600 bg-blue-100",
    teal: "text-teal-600 bg-teal-100",
  };

  const isImage = typeof icon === "string";

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md rounded-xl",
        variants[variant],
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>

            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {/*{change && (
              <p
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  change.type === "increase" ? "text-green-600" : "text-red-600"
                )}
              >
                {change.type === "increase" ? "↗" : "↘"}{" "}
                {Math.abs(change.value)}%
              </p>
            )}*/}
          </div>

          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden",
              iconVariants[variant]
            )}
          >
            {isImage ? (
              <img src={icon} alt="icon" className="w-6 h-6 object-contain" />
            ) : (
              icon && (() => {
                const Icon = icon as LucideIcon;
                return <Icon className="w-6 h-6" />;
              })()
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
