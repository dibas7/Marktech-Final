import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ReceiptForm } from '@/components/ReceiptForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewReceipt() {
  const navigate = useNavigate();

  const handleSuccess = (receiptId: string) => {
    navigate(`/receipt/${receiptId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">New Receipt</h2>
            <p className="text-muted-foreground">Create a new maintenance receipt</p>
          </div>
        </div>

        <ReceiptForm onSuccess={handleSuccess} />
      </main>
    </div>
  );
}
