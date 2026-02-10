import { Receipt } from '@/types/receipt';
import { format } from 'date-fns';

export function exportReceiptsToCsv(receipts: Receipt[], filename: string = 'receipts_backup') {
  // CSV headers - Excel compatible with BOM for proper Nepali/Unicode support
  const headers = [
    'S.N.',
    'Receipt #',
    'Customer Name',
    'Phone',
    'Email',
    'Device Type',
    'Device Model',
    'Serial Number',
    'Accessories',
    'Problem Description',
    'Repair Notes',
    'Device Password',
    'Received Date',
    'Estimated Delivery',
    'Actual Delivery',
    'Status',
    'Created At',
    'Updated At'
  ];

  // Convert receipts to CSV rows
  const rows = receipts.map((receipt, index) => [
    index + 1,
    receipt.receipt_number,
    receipt.customer_name,
    receipt.customer_phone,
    receipt.customer_email || '',
    receipt.device_type,
    receipt.device_model || '',
    receipt.serial_number || '',
    receipt.accessories || '',
    receipt.problem_description,
    receipt.repair_notes || '',
    receipt.device_password || '',
    format(new Date(receipt.received_date), 'yyyy-MM-dd'),
    receipt.estimated_delivery_date ? format(new Date(receipt.estimated_delivery_date), 'yyyy-MM-dd') : '',
    receipt.actual_delivery_date ? format(new Date(receipt.actual_delivery_date), 'yyyy-MM-dd') : '',
    receipt.status,
    format(new Date(receipt.created_at), 'yyyy-MM-dd HH:mm'),
    format(new Date(receipt.updated_at), 'yyyy-MM-dd HH:mm')
  ]);

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeValue = (val: string | number): string => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV content with BOM for Excel Unicode support
  const BOM = '\uFEFF';
  const csvContent = BOM + 
    headers.map(escapeValue).join(',') + '\n' +
    rows.map(row => row.map(escapeValue).join(',')).join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Generate filename with date
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  link.href = url;
  link.download = `${filename}_${dateStr}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
