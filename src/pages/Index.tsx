import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { SearchBar } from '@/components/SearchBar';
import { ReceiptList } from '@/components/ReceiptList';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Download, Upload } from 'lucide-react';
import { useReceipts } from '@/hooks/useReceipts';
import { Link } from 'react-router-dom';
import { exportReceiptsToCsv } from '@/utils/exportCsv';
import { importReceiptsFromCsv } from '@/utils/importCsv';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { data: receipts, isLoading } = useReceipts(searchQuery || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await importReceiptsFromCsv(file);
      
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} receipts`);
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        queryClient.invalidateQueries({ queryKey: ['receipt-stats'] });
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} receipts`);
        console.error('Import errors:', result.errors);
      }
    } catch (error: any) {
      toast.error('Failed to import CSV: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv"
          className="hidden"
        />

        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Manage customer device receipts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="lg"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                if (receipts && receipts.length > 0) {
                  exportReceiptsToCsv(receipts, 'receipts_download');
                  toast.success('CSV downloaded successfully!');
                } else {
                  toast.error('No receipts to download');
                }
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV
            </Button>
            <Button asChild size="lg">
              <Link to="/new">
                <Plus className="w-5 h-5 mr-2" />
                New Receipt
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Search & Recent Receipts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Receipts</h3>
          </div>
          
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          
          <ReceiptList receipts={receipts} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default Index;
