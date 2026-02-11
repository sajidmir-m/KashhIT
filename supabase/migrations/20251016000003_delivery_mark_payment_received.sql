-- Create RPC function for delivery partners to mark payment as received
-- This allows delivery partners to update payment_status for COD orders

CREATE OR REPLACE FUNCTION public.delivery_mark_payment_received(p_order_id UUID)
RETURNS TABLE (
  payment_status TEXT,
  payment_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _partner_id UUID;
  _user_id UUID;
  _current_payment_id TEXT;
  _current_payment_status TEXT;
BEGIN
  -- Ensure caller is a delivery partner and get their partner ID
  SELECT id, user_id INTO _partner_id, _user_id 
  FROM public.delivery_partners 
  WHERE user_id = auth.uid();
  
  IF _partner_id IS NULL THEN
    RAISE EXCEPTION 'Delivery partner profile not found' USING ERRCODE = '42501';
  END IF;

  -- Verify delivery partner is assigned to this order
  IF NOT EXISTS (
    SELECT 1 FROM public.delivery_requests 
    WHERE order_id = p_order_id AND assigned_partner_id = _partner_id
  ) THEN
    RAISE EXCEPTION 'Order not assigned to you' USING ERRCODE = '42501';
  END IF;

  -- Get current payment_id to preserve it
  SELECT o.payment_id, o.payment_status INTO _current_payment_id, _current_payment_status
  FROM public.orders o
  WHERE o.id = p_order_id;
  
  IF _current_payment_id IS NULL THEN
    -- If no payment_id, assume it's COD (default for pending orders)
    _current_payment_id := 'COD';
  END IF;

  -- Update payment status to completed, preserving payment_id
  UPDATE public.orders
  SET 
    payment_status = 'completed',
    payment_id = _current_payment_id,
    updated_at = now()
  WHERE id = p_order_id;

  -- Return the updated values
  RETURN QUERY
  SELECT 
    o.payment_status,
    o.payment_id
  FROM public.orders o
  WHERE o.id = p_order_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.delivery_mark_payment_received(UUID) TO authenticated;

