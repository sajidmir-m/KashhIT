-- Change the default value of is_approved to true
ALTER TABLE public.product_reviews 
ALTER COLUMN is_approved SET DEFAULT true;

-- Update all existing reviews to be approved
UPDATE public.product_reviews 
SET is_approved = true 
WHERE is_approved = false;

-- Create a function to recalculate all product ratings
CREATE OR REPLACE FUNCTION recalculate_all_product_ratings()
RETURNS void AS $$
DECLARE
  product_record RECORD;
BEGIN
  -- Loop through all products
  FOR product_record IN SELECT id FROM products LOOP
    -- Update the rating for each product
    UPDATE products
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM product_reviews
        WHERE product_id = product_record.id
          AND is_approved = true
      ),
      review_count = (
        SELECT COUNT(*)
        FROM product_reviews
        WHERE product_id = product_record.id
          AND is_approved = true
      )
    WHERE id = product_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the recalculation
SELECT recalculate_all_product_ratings();

-- Drop the function as it's no longer needed
DROP FUNCTION recalculate_all_product_ratings();
