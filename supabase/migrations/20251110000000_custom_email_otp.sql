-- Custom email OTP storage
DO $$ BEGIN
  CREATE TABLE public.email_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_email_otp_email ON public.email_otp_codes (email);
CREATE INDEX IF NOT EXISTS idx_email_otp_expires ON public.email_otp_codes (expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_used ON public.email_otp_codes (used_at);

-- Enable RLS and restrict direct client access
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- No direct access by anon/auth users; only service role (Edge Functions) should operate
DROP POLICY IF EXISTS "No client access - service role only" ON public.email_otp_codes;
CREATE POLICY "No client access - service role only" ON public.email_otp_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);


