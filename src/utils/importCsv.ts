import { supabase } from '@/integrations/supabase/client';
import { parse } from 'date-fns';

interface CsvRow {
  'Receipt #'?: string;
  'Customer Name': string;
  'Phone': string;
  'Email'?: string;
  'Device Type': string;
  'Device Model'?: string;
  'Serial Number'?: string;
  'Accessories'?: string;
  'Problem Description': string;
  'Repair Notes'?: string;
  'Device Password'?: string;
  'Received Date'?: string;
  'Estimated Delivery'?: string;
  'Actual Delivery'?: string;
  'Status'?: string;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Remove BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.slice(1);
  }

  const headers = parseCSVLine(headerLine);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    rows.push(row as CsvRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Try yyyy-MM-dd format first
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isNaN(parsed.getTime())) {
      return dateStr;
    }
  } catch {
    // Continue to next format
  }
  
  return null;
}

export async function importReceiptsFromCsv(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
  const text = await file.text();
  const rows = parseCSV(text);
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      // Validate required fields
      if (!row['Customer Name'] || !row['Phone'] || !row['Device Type'] || !row['Problem Description']) {
        errors.push(`Row missing required fields: ${row['Customer Name'] || 'Unknown'}`);
        failed++;
        continue;
      }

      const insertData: any = {
        customer_name: row['Customer Name'],
        customer_phone: row['Phone'],
        customer_email: row['Email'] || null,
        device_type: row['Device Type'],
        device_model: row['Device Model'] || null,
        serial_number: row['Serial Number'] || null,
        accessories: row['Accessories'] || null,
        problem_description: row['Problem Description'],
        repair_notes: row['Repair Notes'] || null,
        device_password: row['Device Password'] || null,
        received_date: parseDate(row['Received Date'] || '') || new Date().toISOString().split('T')[0],
        estimated_delivery_date: parseDate(row['Estimated Delivery'] || ''),
        actual_delivery_date: parseDate(row['Actual Delivery'] || ''),
        status: row['Status'] || 'received',
      };

      const { error } = await supabase
        .from('receipts')
        .insert([insertData]);

      if (error) {
        errors.push(`Failed to insert: ${row['Customer Name']} - ${error.message}`);
        failed++;
      } else {
        success++;
      }
    } catch (err: any) {
      errors.push(`Error processing row: ${err.message}`);
      failed++;
    }
  }

  return { success, failed, errors };
}
