-- Fix RLS policy for delivery_requests: Allow users to insert their own delivery requests

-- Users can insert delivery requests for their own orders
DROP POLICY IF EXISTS "Users can insert own delivery requests" ON public.delivery_requests;
CREATE POLICY "Users can insert own delivery requests" ON public.delivery_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

