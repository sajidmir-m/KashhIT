// Supabase Edge Function: verify-otp-signup
// Verifies OTP, marks it used, then creates a user with password

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type VerifyPayload = {
  email: string
  code: string
  password: string
  full_name?: string
  phone?: string
}

function corsHeaders(origin?: string) {
  // You can restrict to your app domain instead of '*'
  const allowOrigin = origin || '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  try {
    const origin = req.headers.get('origin') ?? undefined

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders(origin) })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders(origin) })
    }

    const { email, code, password, full_name, phone } = (await req.json()) as VerifyPayload
    if (!email || !code || !password) {
      return new Response(JSON.stringify({ error: 'email, code and password are required' }), { status: 400, headers: corsHeaders(origin) })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const nowIso = new Date().toISOString()

    // 1) Find matching OTP
    const { data: otp, error: otpErr } = await supabase
      .from('email_otp_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .is('used_at', null)
      .gt('expires_at', nowIso)
      .maybeSingle()

    if (otpErr || !otp) {
      return new Response(JSON.stringify({ error: 'Invalid or expired code' }), { status: 400, headers: corsHeaders(origin) })
    }

    // 2) Mark OTP used
    const { error: usedErr } = await supabase
      .from('email_otp_codes')
      .update({ used_at: nowIso })
      .eq('id', otp.id)
    if (usedErr) {
      return new Response(JSON.stringify({ error: usedErr.message }), { status: 400, headers: corsHeaders(origin) })
    }

    // 3) Create user (or update password if exists)
    const { data: usersList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1, email })
    const existing = usersList?.users?.[0]
    if (existing) {
      // Update password and confirm email
      const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || existing.user_metadata?.full_name || 'User', phone: phone || null },
      })
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: corsHeaders(origin) })
      }
      return new Response(JSON.stringify({ ok: true, userId: existing.id }), { status: 200, headers: corsHeaders(origin) })
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || 'User', phone: phone || null },
    })
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: corsHeaders(origin) })
    }

    return new Response(JSON.stringify({ ok: true, userId: created.user?.id }), { status: 200, headers: corsHeaders(origin) })
  } catch (e) {
    const origin = req.headers.get('origin') ?? undefined
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400, headers: corsHeaders(origin) })
  }
})


