import { AppointmentStatus } from '@/types/appointment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-secondary text-secondary-foreground',
  },
  'checked-in': {
    label: 'Checked In',
    className: 'bg-waiting-soft text-waiting border-waiting/20',
  },
  waiting: {
    label: 'Waiting',
    className: 'bg-waiting text-waiting-foreground',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-primary text-primary-foreground animate-pulse',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success text-success-foreground',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive text-destructive-foreground',
  },
  'no-show': {
    label: 'No Show',
    className: 'bg-warning text-warning-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={cn(config.className, className)}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
}