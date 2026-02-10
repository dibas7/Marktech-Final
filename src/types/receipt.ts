export type ReceiptStatus = 'received' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';

export interface Receipt {
  id: string;
  receipt_number: number;
  group_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  device_type: string;
  device_model: string | null;
  serial_number: string | null;
  accessories: string | null;
  problem_description: string;
  repair_notes: string | null;
  received_date: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  device_password: string | null;
  status: ReceiptStatus;
  created_at: string;
  updated_at: string;
}

export interface ReceiptFormData {
  customer_name: string;
  customer_phone: string;
  device_type: string;
  device_model?: string;
  serial_number?: string;
  has_password_lock?: boolean;
  device_password?: string | null;
  accessories?: string | null;
  problem_description: string;
  estimated_delivery_date?: string;
  group_id?: string;
}
