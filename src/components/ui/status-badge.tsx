import { cn } from '@/lib/utils';

type StatusType = 
  | 'ordered'
  | 'collected'
  | 'received'
  | 'processing'
  | 'validation'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'pending'
  | 'paid'
  | 'partial'
  | 'urgent'
  | 'stat'
  | 'normal'
  | 'critical'
  | 'high'
  | 'low';

const statusStyles: Record<StatusType, string> = {
  ordered: 'bg-muted text-muted-foreground',
  collected: 'bg-info/10 text-info border border-info/30',
  received: 'bg-info/10 text-info border border-info/30',
  processing: 'bg-processing/10 text-processing border border-processing/30',
  validation: 'bg-warning/10 text-warning border border-warning/30',
  approved: 'bg-success/10 text-success border border-success/30',
  completed: 'bg-success/10 text-success border border-success/30',
  rejected: 'bg-destructive/10 text-destructive border border-destructive/30',
  pending: 'bg-warning/10 text-warning border border-warning/30',
  paid: 'bg-success/10 text-success border border-success/30',
  partial: 'bg-info/10 text-info border border-info/30',
  urgent: 'bg-warning/10 text-warning border border-warning/30',
  stat: 'bg-critical/10 text-critical border border-critical/30 animate-pulse-subtle',
  normal: 'bg-success/10 text-success border border-success/30',
  critical: 'bg-critical/10 text-critical border border-critical/30',
  high: 'bg-warning/10 text-warning border border-warning/30',
  low: 'bg-info/10 text-info border border-info/30',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || 'pending').toLowerCase().replace(/\s+/g, '') as StatusType;
  const key = Object.keys(statusStyles).find(k => 
    normalizedStatus.includes(k) || k.includes(normalizedStatus)
  ) as StatusType || 'pending';

  return (
    <span className={cn('status-badge', statusStyles[key], className)}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        key === 'stat' || key === 'critical' ? 'bg-critical animate-pulse' :
        key === 'approved' || key === 'completed' || key === 'paid' || key === 'normal' ? 'bg-success' :
        key === 'processing' ? 'bg-processing' :
        key === 'validation' || key === 'pending' || key === 'partial' || key === 'high' || key === 'urgent' ? 'bg-warning' :
        key === 'rejected' ? 'bg-destructive' :
        'bg-current'
      )} />
      {status || 'Pending'}
    </span>
  );
}
