-- Update create_product function to accept new product detail fields
-- Drop the old function first (with old signature)
DROP FUNCTION IF EXISTS public.create_product(UUID, TEXT, TEXT, NUMERIC, INTEGER, TEXT, TEXT);

-- Create the new function with updated signature
CREATE OR REPLACE FUNCTION public.create_product(
  p_category_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_stock INTEGER,
  p_unit TEXT,
  p_image_url TEXT,
  p_brand TEXT DEFAULT NULL,
  p_dietary_preference TEXT DEFAULT NULL,
  p_key_features TEXT DEFAULT NULL,
  p_disclaimer TEXT DEFAULT NULL,
  p_customer_care_details TEXT DEFAULT NULL,
  p_seller_name TEXT DEFAULT NULL,
  p_seller_address TEXT DEFAULT NULL,
  p_seller_license_no TEXT DEFAULT NULL,
  p_country_of_origin TEXT DEFAULT NULL,
  p_shelf_life TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id UUID;
  v_product_id UUID;
BEGIN
  -- Ensure caller is a vendor and fetch their vendor id
  SELECT id INTO v_vendor_id FROM public.vendors WHERE user_id = auth.uid();
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Vendor profile not found for user %', auth.uid() USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Basic validations
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Product name is required' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_price IS NULL OR p_price < 0 THEN
    RAISE EXCEPTION 'Price must be >= 0' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_stock IS NULL OR p_stock < 0 THEN
    RAISE EXCEPTION 'Stock must be >= 0' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  INSERT INTO public.products (
    vendor_id, category_id, name, description, price, stock, unit, image_url,
    brand, dietary_preference, key_features, disclaimer, customer_care_details,
    seller_name, seller_address, seller_license_no, country_of_origin, shelf_life,
    is_active, is_approved
  ) VALUES (
    v_vendor_id, p_category_id, btrim(p_name), NULLIF(btrim(COALESCE(p_description, '')), ''), 
    p_price, p_stock, NULLIF(btrim(COALESCE(p_unit, '')), ''), NULLIF(btrim(COALESCE(p_image_url, '')), ''),
    NULLIF(btrim(COALESCE(p_brand, '')), ''), NULLIF(btrim(COALESCE(p_dietary_preference, '')), ''),
    NULLIF(btrim(COALESCE(p_key_features, '')), ''), NULLIF(btrim(COALESCE(p_disclaimer, '')), ''),
    NULLIF(btrim(COALESCE(p_customer_care_details, '')), ''), NULLIF(btrim(COALESCE(p_seller_name, '')), ''),
    NULLIF(btrim(COALESCE(p_seller_address, '')), ''), NULLIF(btrim(COALESCE(p_seller_license_no, '')), ''),
    NULLIF(btrim(COALESCE(p_country_of_origin, '')), ''), NULLIF(btrim(COALESCE(p_shelf_life, '')), ''),
    true, false
  ) RETURNING id INTO v_product_id;

  RETURN v_product_id;
END;
$$;

-- Grant permissions
-- Query the function signature dynamically and grant permissions
DO $$
DECLARE
  func_signature TEXT;
BEGIN
  -- Get the function signature from pg_proc
  SELECT pg_get_function_identity_arguments(p.oid)
  INTO func_signature
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'create_product'
    AND n.nspname = 'public'
  LIMIT 1;
  
  -- Grant permissions using the found signature
  IF func_signature IS NOT NULL THEN
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.create_product(%s) TO anon, authenticated', func_signature);
  END IF;
END $$;

