-- Reset all deliver orders back to pending for testing
-- Run this ONLY if you want to test the review flow with existing orders
UPDATE public.orders 
SET review_status = 'pending' 
WHERE delivery_status = 'delivered';

-- Or reset just one specific order (replace 'your-order-id' with the actual order ID):
-- UPDATE public.orders 
-- SET review_status = 'pending'  
-- WHERE id = 'your-order-id';
