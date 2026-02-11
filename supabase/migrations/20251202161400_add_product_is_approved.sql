-- Add is_approved column to products table
-- This column controls whether a product is visible to customers
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Update existing products to be approved by default
UPDATE public.products 
SET is_approved = true 
WHERE is_approved IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.is_approved IS 'Whether the product has been approved by admin and is visible to customers';
