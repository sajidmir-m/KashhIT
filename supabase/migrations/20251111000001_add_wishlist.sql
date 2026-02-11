-- Wishlist System
-- Allows users to save products to their wishlist

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One wishlist entry per user per product
  UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at DESC);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist
-- Users can view their own wishlist
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add items to their wishlist
DROP POLICY IF EXISTS "Users can add to their wishlist" ON public.wishlist;
CREATE POLICY "Users can add to their wishlist" ON public.wishlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove items from their wishlist
DROP POLICY IF EXISTS "Users can remove from their wishlist" ON public.wishlist;
CREATE POLICY "Users can remove from their wishlist" ON public.wishlist
  FOR DELETE
  USING (auth.uid() = user_id);

