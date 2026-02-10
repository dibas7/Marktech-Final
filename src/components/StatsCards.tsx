import { useReceiptStats } from '@/hooks/useReceipts';
import { Card, CardContent } from '@/components/ui/card';
import { Inbox, Wrench, CheckCircle, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCircularCounter } from './AnimatedCircularCounter';

export function StatsCards() {
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

  const cards = [
    {
      title: 'Received',
      value: stats?.received || 0,
      icon: Inbox,
      className: 'border-l-4 border-l-primary',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress || 0,
      icon: Wrench,
      className: 'border-l-4 border-l-amber-500',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle,
      className: 'border-l-4 border-l-emerald-500',
    },
    {
      title: 'Delivered',
      value: stats?.delivered || 0,
      icon: Truck,
      className: 'border-l-4 border-l-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Animated Circular Counter for Total Customers */}
      <AnimatedCircularCounter value={stats?.total || 0} />

      {/* Status Cards */}
      {cards.map((card) => (
        <Card key={card.title} className={`shadow-card ${card.className}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
