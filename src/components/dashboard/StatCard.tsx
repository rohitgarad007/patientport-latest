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
  icon?: LucideIcon | string; // Lucide icon or image path
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "pink"
    | "purple"
    | "blue"
    | "teal";
  gradient?: boolean; // ✅ enable gradient style
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  change,
  icon,
  variant = "default",
  gradient = false,
  className,
}: StatsCardProps) {
  // ✅ Card background variants
  const variants = {
    default: {
      solid: "bg-white border border-border",
      gradient:
        "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
    },
    success: {
      solid: "bg-green-50 border border-green-200",
      gradient:
        "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    },
    warning: {
      solid: "bg-orange-50 border border-orange-200",
      gradient:
        "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
    },
    danger: {
      solid: "bg-red-50 border border-red-200",
      gradient:
        "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
    },
    pink: {
      solid: "bg-pink-50 border border-pink-200",
      gradient:
        "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900",
    },
    purple: {
      solid: "bg-purple-50 border border-purple-200",
      gradient:
        "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    },
    blue: {
      solid: "bg-blue-50 border border-blue-200",
      gradient:
        "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    },
    teal: {
      solid: "bg-teal-50 border border-teal-200",
      gradient:
        "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
    },
  };

  // ✅ Text + Icon color styles
  const textColors = {
    default: "text-primary dark:text-primary-300",
    success: "text-green-600 dark:text-green-300",
    warning: "text-orange-600 dark:text-orange-300",
    danger: "text-red-600 dark:text-red-300",
    pink: "text-pink-600 dark:text-pink-300",
    purple: "text-purple-600 dark:text-purple-300",
    blue: "text-blue-600 dark:text-blue-300",
    teal: "text-teal-600 dark:text-teal-300",
  };

  const iconBgColors = {
    default: "bg-primary text-white",
    success: "bg-green-500 text-white",
    warning: "bg-orange-500 text-white",
    danger: "bg-red-500 text-white",
    pink: "bg-pink-500 text-white",
    purple: "bg-purple-500 text-white",
    blue: "bg-blue-500 text-white",
    teal: "bg-teal-500 text-white",
  };

  const isImage = typeof icon === "string";

  return (
    <Card
      className={cn(
        "border-0 shadow-md bg-gradient-to-br shadow-md rounded-xl transition-all hover:shadow-lg",
        gradient ? variants[variant].gradient : variants[variant].solid,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left: Title / Value / Description */}
          <div>
            <p className={cn("text-sm font-medium", textColors[variant])}>
              {title}
            </p>
            <p
              className={cn(
                "text-2xl font-bold mt-1",
                textColors[variant].replace("text-", "text-")
              )}
            >
              {value}
            </p>
            {description && (
              <p
                className={cn("text-xs mt-1", textColors[variant])}
              >
                {description}
              </p>
            )}
          </div>

          {/* Right: Icon */}
          {icon && (
            <div
              className={cn(
                "p-3 rounded-full flex items-center justify-center",
                iconBgColors[variant]
              )}
            >
              {isImage ? (
                <img
                  src={icon}
                  alt="icon"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                (() => {
                  const Icon = icon as LucideIcon;
                  return <Icon className="w-6 h-6" />;
                })()
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
