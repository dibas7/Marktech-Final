import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { useReceipt, useUpdateReceiptStatus } from '@/hooks/useReceipts';
import { RepairNoteEditor } from '@/components/RepairNoteEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, User, Laptop, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ReceiptStatus } from '@/types/receipt';

export default function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: receipt, isLoading } = useReceipt(id);
  const updateStatus = useUpdateReceiptStatus();

  const handleStatusChange = (status: ReceiptStatus) => {
    if (id) {
      updateStatus.mutate({ id, status });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Receipt not found</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-mono">#{receipt.receipt_number}</h2>
                <StatusBadge status={receipt.status} />
              </div>
              <p className="text-muted-foreground">
                Received on {format(new Date(receipt.received_date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={receipt.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to={`/receipt/${receipt.id}/print`}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{receipt.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{receipt.customer_phone}</p>
              </div>
              {/* Customer ID is hidden as per requirement */}
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Laptop className="w-5 h-5 text-primary" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Device Type</p>
                <p className="font-medium capitalize">{receipt.device_type}</p>
              </div>
              {receipt.device_model && (
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{receipt.device_model}</p>
                </div>
              )}
              {receipt.serial_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium font-mono">{receipt.serial_number}</p>
                </div>
              )}
              {receipt.device_password && (
                <div>
                  <p className="text-sm text-muted-foreground">Device Password</p>
                  <p className="font-medium font-mono">{receipt.device_password}</p>
                </div>
              )}
              {receipt.accessories && (
                <div>
                  <p className="text-sm text-muted-foreground">Accessories</p>
                  <p className="font-medium">{receipt.accessories}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Problem Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{receipt.problem_description}</p>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {receipt.estimated_delivery_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">
                    {format(new Date(receipt.estimated_delivery_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              {receipt.actual_delivery_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Actual Delivery</p>
                  <p className="font-medium">
                    {format(new Date(receipt.actual_delivery_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Repair Notes - Admin Only Section (not printed) */}
        <RepairNoteEditor 
          receiptId={receipt.id}
          currentNote={receipt.repair_notes}
          status={receipt.status}
        />
      </main>
    </div>
  );
}
