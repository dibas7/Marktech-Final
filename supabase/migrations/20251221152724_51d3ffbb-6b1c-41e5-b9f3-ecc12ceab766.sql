-- Create receipts table for customer device maintenance tracking
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number INTEGER NOT NULL UNIQUE,
  -- Customer details
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  -- Device details
  device_type TEXT NOT NULL,
  device_model TEXT,
  serial_number TEXT,
  accessories TEXT,
  -- Problem and notes
  problem_description TEXT NOT NULL,
  repair_notes TEXT,
  -- Dates
  received_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  -- Password/Lock info
  device_password TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'completed', 'delivered', 'cancelled')),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for receipt numbers starting at 4869
CREATE SEQUENCE public.receipt_number_seq START WITH 4869;

-- Create function to auto-assign receipt number
CREATE OR REPLACE FUNCTION public.assign_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.receipt_number := nextval('public.receipt_number_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign receipt number before insert
CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_receipt_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for search
CREATE INDEX idx_receipts_receipt_number ON public.receipts(receipt_number);
CREATE INDEX idx_receipts_customer_phone ON public.receipts(customer_phone);
CREATE INDEX idx_receipts_status ON public.receipts(status);
CREATE INDEX idx_receipts_received_date ON public.receipts(received_date DESC);

-- Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (public access for repair center use)
-- In production, you'd want to add user authentication
CREATE POLICY "Allow all operations on receipts"
ON public.receipts
FOR ALL
USING (true)
WITH CHECK (true);