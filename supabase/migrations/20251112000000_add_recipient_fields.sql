-- Add recipient fields to orders table for "Order for Someone Else" feature
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT,
  ADD COLUMN IF NOT EXISTS recipient_address TEXT;

-- Add comments
COMMENT ON COLUMN public.orders.recipient_name IS 'Name of the recipient when order is for someone else';
COMMENT ON COLUMN public.orders.recipient_phone IS 'Phone number of the recipient when order is for someone else';
COMMENT ON COLUMN public.orders.recipient_address IS 'Full address of the recipient when order is for someone else';

