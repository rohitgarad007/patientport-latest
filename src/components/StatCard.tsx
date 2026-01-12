import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: number | string;
  label: string;
  variant?: 'available' | 'occupied' | 'reserved' | 'default';
}

const variantStyles = {
  available: 'text-available',
  occupied: 'text-occupied',
  reserved: 'text-reserved',
  default: 'text-foreground',
};

export const StatCard = ({ value, label, variant = 'default' }: StatCardProps) => {
  return (
    <Card className="p-2 sm:p-6 flex flex-col gap-1 sm:gap-2">
      {/* Value */}
      <div className={cn(
        'font-bold',
        variantStyles[variant],
        'text-[13px] sm:text-4xl' // 13px on mobile, 4xl on sm+
      )}>
        {value}
      </div>

      {/* Label */}
      <div className="text-muted-foreground text-[11px] sm:text-sm">
        {label}
      </div>
    </Card>
  );
};
