// Supabase Edge Function: send-otp
// Generates a 6-digit OTP, stores it, and emails it via SMTP

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

// Simple SMTP mailer using deno_smtp
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

type SendOtpPayload = {
  email: string
  full_name?: string
}

function generateCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return String(n)
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

    const { email, full_name } = (await req.json()) as SendOtpPayload
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: corsHeaders(origin) })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1) Create OTP and store
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Clean up previous unused OTPs for this email
    await supabase.from('email_otp_codes').delete().eq('email', email.toLowerCase()).is('used_at', null)

    const { error: insErr } = await supabase.from('email_otp_codes').insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
    } as any)
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), { status: 400, headers: corsHeaders(origin) })
    }

    // 2) Send email via SMTP (Gmail App Password recommended)
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort = Number(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')
    const senderEmail = Deno.env.get('SMTP_SENDER_EMAIL') || smtpUser
    const senderName = Deno.env.get('SMTP_SENDER_NAME') || 'Kassh.IT'

    if (!smtpUser || !smtpPass || !senderEmail) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), { status: 500, headers: corsHeaders(origin) })
    }

    const client = new SmtpClient()
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    })

    const subject = `Kassh.IT verification code: ${code}`
    const body = [
      `Hi ${full_name || ''}`.trim() + ',',
      '',
      `Kassh.IT verification: your OTP is ${code}.`,
      'Enter this code in the app to verify your email.',
      'This code expires in 10 minutes.',
      '',
      'Thanks,',
      'Kassh.IT',
    ].join('\n')

    await client.send({
      from: `${senderName} <${senderEmail}>`,
      to: email,
      subject,
      content: body,
    })
    await client.close()

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders(origin) })
  } catch (e) {
    const origin = req.headers.get('origin') ?? undefined
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400, headers: corsHeaders(origin) })
  }
})


