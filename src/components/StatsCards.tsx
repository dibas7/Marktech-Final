import { useReceiptStats } from '@/hooks/useReceipts';
import { Card, CardContent } from '@/components/ui/card';
import { Inbox, Wrench, CheckCircle, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCircularCounter } from './AnimatedCircularCounter';
import { DashboardStatusFilter, ReceiptStatus } from '@/types/receipt';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  activeFilter: DashboardStatusFilter;
  onFilterChange: (filter: DashboardStatusFilter) => void;
}

const STATUS_CARDS: {
  title: string;
  filter: ReceiptStatus;
  icon: typeof Inbox;
  className: string;
  activeRing: string;
}[] = [
  {
    title: 'Received',
    filter: 'received',
    icon: Inbox,
    className: 'border-l-4 border-l-primary',
    activeRing: 'ring-primary',
  },
  {
    title: 'In Progress',
    filter: 'in_progress',
    icon: Wrench,
    className: 'border-l-4 border-l-amber-500',
    activeRing: 'ring-amber-500',
  },
  {
    title: 'Completed',
    filter: 'completed',
    icon: CheckCircle,
    className: 'border-l-4 border-l-emerald-500',
    activeRing: 'ring-emerald-500',
  },
  {
    title: 'Delivered',
    filter: 'delivered',
    icon: Truck,
    className: 'border-l-4 border-l-teal-500',
    activeRing: 'ring-teal-500',
  },
];

export function StatsCards({ activeFilter, onFilterChange }: StatsCardsProps) {
  const { data: stats, isLoading } = useReceiptStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <AnimatedCircularCounter
        value={stats?.total || 0}
        isActive={activeFilter === 'all'}
        onClick={() => onFilterChange('all')}
      />

      {STATUS_CARDS.map((card) => {
        const isActive = activeFilter === card.filter;
        const value =
          card.filter === 'received'
            ? stats?.received
            : card.filter === 'in_progress'
              ? stats?.in_progress
              : card.filter === 'completed'
                ? stats?.completed
                : stats?.delivered;

        return (
          <Card
            key={card.title}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={`${card.title}: ${value ?? 0}. Filter by ${card.title}.`}
            onClick={() => onFilterChange(card.filter)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFilterChange(card.filter);
              }
            }}
            className={cn(
              'shadow-card cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              card.className,
              isActive && `ring-2 ring-offset-2 shadow-md ${card.activeRing}`,
              !isActive && 'hover:bg-muted/30'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{value ?? 0}</p>
                </div>
                <card.icon className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
