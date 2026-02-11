-- Add new fields to products table for product details
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS dietary_preference TEXT,
  ADD COLUMN IF NOT EXISTS key_features TEXT,
  ADD COLUMN IF NOT EXISTS disclaimer TEXT,
  ADD COLUMN IF NOT EXISTS customer_care_details TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_address TEXT,
  ADD COLUMN IF NOT EXISTS seller_license_no TEXT,
  ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
  ADD COLUMN IF NOT EXISTS shelf_life TEXT;

