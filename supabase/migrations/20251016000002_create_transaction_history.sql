-- Create transaction_history table to store all payment transactions
-- This table stores complete transaction information including user, vendor, order, and payment details

CREATE TABLE IF NOT EXISTS public.transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT, -- Snapshot of user name at time of transaction
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT, -- Snapshot of vendor name at time of transaction
  amount DECIMAL(10,2) NOT NULL, -- Transaction amount
  subtotal DECIMAL(10,2) NOT NULL, -- Order subtotal
  discount_amount DECIMAL(10,2) DEFAULT 0, -- Discount applied
  final_amount DECIMAL(10,2) NOT NULL, -- Final amount paid
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay', 'other')), -- Payment method used
  payment_id TEXT, -- Payment ID from payment gateway (e.g., Razorpay payment ID)
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  order_details JSONB, -- Store order items details as JSON
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_history_order_id ON public.transaction_history(order_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_id ON public.transaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_vendor_id ON public.transaction_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_payment_status ON public.transaction_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_transaction_history_transaction_date ON public.transaction_history(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_history_payment_method ON public.transaction_history(payment_method);

-- Enable RLS
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transaction_history
  FOR SELECT USING (auth.uid() = user_id);

-- Vendors can view transactions for their orders
CREATE POLICY "Vendors can view their transactions" ON public.transaction_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      JOIN public.products p ON p.id = oi.product_id
      JOIN public.vendors v ON v.id = p.vendor_id
      WHERE o.id = transaction_history.order_id 
        AND v.user_id = auth.uid()
    )
  );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transaction_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- System can insert transactions (via service role or authenticated users creating their own orders)
CREATE POLICY "Authenticated users can insert own transactions" ON public.transaction_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create transaction history when order is created/updated
CREATE OR REPLACE FUNCTION public.create_transaction_history()
RETURNS TRIGGER AS $$
DECLARE
  _user_name TEXT;
  _vendor_id UUID;
  _vendor_name TEXT;
  _order_details JSONB;
  _payment_method TEXT;
BEGIN
  -- Get user name
  SELECT full_name INTO _user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get vendor info from first product in order
  SELECT p.vendor_id, v.business_name
  INTO _vendor_id, _vendor_name
  FROM public.order_items oi
  JOIN public.products p ON p.id = oi.product_id
  LEFT JOIN public.vendors v ON v.id = p.vendor_id
  WHERE oi.order_id = NEW.id
  LIMIT 1;

  -- Get order items details as JSON
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_name', oi.snapshot_name,
      'product_price', oi.snapshot_price,
      'quantity', oi.quantity,
      'item_total', oi.snapshot_price * oi.quantity
    )
  ) INTO _order_details
  FROM public.order_items oi
  WHERE oi.order_id = NEW.id;

  -- Determine payment method
  IF NEW.payment_id = 'COD' THEN
    _payment_method := 'cod';
  ELSIF NEW.payment_id IS NOT NULL AND NEW.payment_id != 'COD' THEN
    _payment_method := 'razorpay';
  ELSE
    _payment_method := 'other';
  END IF;

  -- Insert or update transaction history
  INSERT INTO public.transaction_history (
    order_id,
    user_id,
    user_name,
    vendor_id,
    vendor_name,
    amount,
    subtotal,
    discount_amount,
    final_amount,
    payment_method,
    payment_id,
    payment_status,
    order_details,
    transaction_date
  ) VALUES (
    NEW.id,
    NEW.user_id,
    _user_name,
    _vendor_id,
    _vendor_name,
    NEW.final_amount,
    NEW.subtotal,
    NEW.discount_amount,
    NEW.final_amount,
    _payment_method,
    NEW.payment_id,
    NEW.payment_status,
    _order_details,
    NEW.created_at
  )
  ON CONFLICT (order_id) DO UPDATE SET
    payment_status = NEW.payment_status,
    payment_id = NEW.payment_id,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create transaction history
DROP TRIGGER IF EXISTS trigger_create_transaction_history ON public.orders;
CREATE TRIGGER trigger_create_transaction_history
  AFTER INSERT OR UPDATE OF payment_status, payment_id ON public.orders
  FOR EACH ROW
  WHEN (NEW.payment_status IS NOT NULL)
  EXECUTE FUNCTION public.create_transaction_history();

-- Grant necessary permissions
GRANT SELECT ON public.transaction_history TO authenticated;
GRANT INSERT ON public.transaction_history TO authenticated;

