-- Add group_id column to group multiple devices under one receipt
ALTER TABLE public.receipts ADD COLUMN group_id uuid;

-- Create index for efficient grouping queries
CREATE INDEX idx_receipts_group_id ON public.receipts(group_id);

-- Create function to assign shared receipt_number for grouped devices
CREATE OR REPLACE FUNCTION public.assign_group_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_number integer;
BEGIN
  -- If this device has a group_id, check if another device in the group already has a receipt_number
  IF NEW.group_id IS NOT NULL THEN
    SELECT receipt_number INTO existing_number
    FROM public.receipts
    WHERE group_id = NEW.group_id AND receipt_number IS NOT NULL
    LIMIT 1;
    
    IF existing_number IS NOT NULL THEN
      NEW.receipt_number := existing_number;
      RETURN NEW;
    END IF;
  END IF;
  
  -- Otherwise assign a new receipt number
  NEW.receipt_number := nextval('public.receipt_number_seq');
  RETURN NEW;
END;
$function$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS assign_receipt_number_trigger ON public.receipts;
CREATE TRIGGER assign_receipt_number_trigger
  BEFORE INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_group_receipt_number();