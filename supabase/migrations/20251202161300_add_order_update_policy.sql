-- Add RLS policy to allow users to update their own order review status
-- This is required for the "Later" and "Give Review" buttons to work
CREATE POLICY "Users can update own order review status"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
