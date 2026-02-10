-- Ensure grouped devices share the same receipt_number and remove old per-row trigger
-- This migration:
-- 1) Drops any old triggers that always assign a new receipt_number
-- 2) Creates a single trigger that uses assign_group_receipt_number

-- Drop legacy triggers if they exist
DROP TRIGGER IF EXISTS set_receipt_number ON public.receipts;
DROP TRIGGER IF EXISTS assign_receipt_number_trigger ON public.receipts;

-- Create the correct trigger pointing to assign_group_receipt_number
CREATE TRIGGER assign_group_receipt_number_trigger
  BEFORE INSERT ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_group_receipt_number();

