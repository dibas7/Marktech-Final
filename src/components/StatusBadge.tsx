import { ReceiptStatus } from '@/types/receipt';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ReceiptStatus;
  className?: string;
}

const statusConfig: Record<ReceiptStatus, { label: string; className: string }> = {
  received: { label: 'Received', className: 'status-received' },
  in_progress: { label: 'In Progress', className: 'status-in-progress' },
  completed: { label: 'Completed', className: 'status-completed' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
