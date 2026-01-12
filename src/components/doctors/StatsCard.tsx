import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className={cn("shadow-card hover:shadow-card-hover transition-all", color)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground/70 mb-1">{title}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <p className="text-xs text-success mt-2 font-medium">{trend}</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
