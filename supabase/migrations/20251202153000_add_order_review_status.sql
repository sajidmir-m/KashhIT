-- Add review_status column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'skipped'));

-- Update existing delivered orders to 'skipped' so they don't suddenly appear in Live Orders
UPDATE public.orders 
SET review_status = 'skipped' 
WHERE delivery_status = 'delivered' AND review_status = 'pending';
