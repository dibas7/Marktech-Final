import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReceipts } from '@/hooks/useReceipts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Trash2, FileText, Pencil } from 'lucide-react';
import { formatNepaliDate } from '@/utils/nepaliDate';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Settings() {
  const { isAdmin } = useAuth();
  const { data: receipts, isLoading } = useReceipts();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteReceipt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['receipt-stats'] });
      toast.success('Receipt deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete receipt');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Manage receipts data.
          </p>
        </div>

        {!isAdmin && (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                Only admins can delete receipts. Please contact an administrator if you need a receipt removed.
              </p>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !receipts || receipts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No receipts found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead>Accessories</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Actual Delivery</TableHead>
                        <TableHead>Delivery Condition</TableHead>
                        <TableHead>Delivered By / To</TableHead>
                        <TableHead className="w-[80px] text-right">
                          Edit
                        </TableHead>
                        <TableHead className="w-[80px] text-right">
                          Delete
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((r) => (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => navigate(`/receipt/${r.id}`)}
                        >
                          <TableCell className="font-mono font-semibold">
                            #{r.receipt_number}
                          </TableCell>
                          <TableCell>{r.customer_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.customer_phone}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.customer_email || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">
                            {r.device_type}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.device_model || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.serial_number || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.accessories || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">
                            {r.status}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {formatNepaliDate(r.received_date)}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {r.estimated_delivery_date
                              ? formatNepaliDate(r.estimated_delivery_date)
                              : '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {r.actual_delivery_date
                              ? formatNepaliDate(r.actual_delivery_date)
                              : '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.delivery_condition || '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.delivered_by || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              asChild
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Link to={`/receipt/${r.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleteReceipt.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReceipt.mutate(r.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

