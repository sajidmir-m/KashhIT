// Supabase Edge Function: send-order-email
// Sends email notifications for order events (confirmation, status updates, etc.)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  html: string
  type: 'order_confirmation' | 'order_status_update' | 'order_delivered'
  orderId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload: EmailPayload = await req.json()
    const { to, subject, html, type, orderId } = payload

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via SMTP (same as send-otp function)
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort = Number(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')
    const senderEmail = Deno.env.get('SMTP_SENDER_EMAIL') || smtpUser
    const senderName = Deno.env.get('SMTP_SENDER_NAME') || 'Kassh.IT'

    if (!smtpUser || !smtpPass || !senderEmail) {
      console.warn('SMTP not configured, email will not be sent')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'SMTP not configured',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 so order creation doesn't fail
        }
      )
    }

    try {
      const client = new SmtpClient()
      await client.connectTLS({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
      })

      await client.send({
        from: `${senderName} <${senderEmail}>`,
        to: to,
        subject: subject,
        content: html,
        html: html,
      })
      await client.close()

      console.log('Order email sent successfully:', { to, subject, type, orderId })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (emailError) {
      console.error('Failed to send order email:', emailError)
      // Don't fail the request if email fails
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Order created but email failed to send',
          error: emailError instanceof Error ? emailError.message : String(emailError),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 so order creation doesn't fail
        }
      )
    }

  } catch (error) {
    console.error('Error in send-order-email:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

