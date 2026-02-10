import { Receipt } from '@/types/receipt';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Pencil } from 'lucide-react';
import { formatNepaliDate } from '@/utils/nepaliDate';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

interface ReceiptListProps {
  receipts: Receipt[] | undefined;
  isLoading: boolean;
}

export function ReceiptList({ receipts, isLoading }: ReceiptListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No receipts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground font-semibold w-16">S.N.</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Receipt #</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Customer</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Phone</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Device</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Date</TableHead>
            <TableHead className="text-primary-foreground font-semibold">Status</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt, index) => (
            <TableRow
              key={receipt.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-mono font-bold text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-mono font-bold text-primary">
                #{receipt.receipt_number}
              </TableCell>
              <TableCell className="font-medium">{receipt.customer_name}</TableCell>
              <TableCell className="text-muted-foreground">{receipt.customer_phone}</TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {receipt.device_type} {receipt.device_model && `- ${receipt.device_model}`}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatNepaliDate(receipt.received_date)}
              </TableCell>
              <TableCell>
                <StatusBadge status={receipt.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/receipt/${receipt.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/receipt/${receipt.id}/edit`}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/receipt/${receipt.id}/print`}>
                      <Printer className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
