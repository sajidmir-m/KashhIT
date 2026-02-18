// Supabase Edge Function: create-vendor
// Creates vendor account automatically, generates password, and sends credentials via email using SMTP

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type CreateVendorPayload = {
  email: string
  business_name: string
  business_description?: string | null
  business_address?: string | null
  gstin?: string | null
  full_name?: string
  phone?: string | null
  invitation_id?: string
}

function generatePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const all = lowercase + uppercase + numbers + symbols

  let password = ''
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  return password.split('').sort(() => Math.random() - 0.5).join('')
}

async function sendEmailViaSMTP(to: string, subject: string, body: string, smtpConfig: any) {
  const { host, port, username, password, from } = smtpConfig

  console.log('Connecting to SMTP server:', host, port)

  // Connect to SMTP server
  const conn = await Deno.connect({ hostname: host, port: port })

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  async function readResponse() {
    const buffer = new Uint8Array(4096)
    const n = await conn.read(buffer)
    if (n === null) throw new Error('Connection closed')
    const response = decoder.decode(buffer.subarray(0, n))
    console.log('SMTP:', response.trim())
    return response
  }

  async function sendCommand(command: string) {
    console.log('Sending:', command.substring(0, 50))
    await conn.write(encoder.encode(command + '\r\n'))
  }

  try {
    // Read greeting
    await readResponse()

    // EHLO
    await sendCommand(`EHLO ${host}`)
    await readResponse()

    // STARTTLS
    await sendCommand('STARTTLS')
    await readResponse()

    // Upgrade to TLS
    console.log('Upgrading to TLS...')
    const tlsConn = await Deno.startTls(conn, { hostname: host })

    // Re-assign connection
    const tlsEncoder = new TextEncoder()
    const tlsDecoder = new TextDecoder()

    async function tlsReadResponse() {
      const buffer = new Uint8Array(4096)
      const n = await tlsConn.read(buffer)
      if (n === null) throw new Error('Connection closed')
      const response = tlsDecoder.decode(buffer.subarray(0, n))
      console.log('SMTP TLS:', response.trim())
      return response
    }

    async function tlsSendCommand(command: string) {
      console.log('Sending TLS:', command.substring(0, 50))
      await tlsConn.write(tlsEncoder.encode(command + '\r\n'))
    }

    // EHLO again after TLS
    await tlsSendCommand(`EHLO ${host}`)
    await tlsReadResponse()

    // AUTH LOGIN
    await tlsSendCommand('AUTH LOGIN')
    await tlsReadResponse()

    // Username (base64)
    await tlsSendCommand(btoa(username))
    await tlsReadResponse()

    // Password (base64)
    await tlsSendCommand(btoa(password))
    await tlsReadResponse()

    console.log('SMTP authentication successful')

    // MAIL FROM
    await tlsSendCommand(`MAIL FROM:<${from}>`)
    await tlsReadResponse()

    // RCPT TO
    await tlsSendCommand(`RCPT TO:<${to}>`)
    await tlsReadResponse()

    // DATA
    await tlsSendCommand('DATA')
    await tlsReadResponse()

    // Email content
    const emailContent = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
      '.',
    ].join('\r\n')

    await tlsSendCommand(emailContent)
    await tlsReadResponse()

    // QUIT
    await tlsSendCommand('QUIT')
    await tlsReadResponse()

    tlsConn.close()
    console.log('Email sent successfully via SMTP')

    return true
  } catch (error) {
    console.error('SMTP error:', error)
    try { conn.close() } catch { }
    throw error
  }
}

function corsHeaders(origin?: string) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  console.log('=== create-vendor function called ===')
  console.log('Method:', req.method)

  try {
    const origin = req.headers.get('origin') ?? undefined

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders(origin) })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders(origin) })
    }

    let payload: CreateVendorPayload
    try {
      const body = await req.json()
      payload = body as CreateVendorPayload
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: corsHeaders(origin) })
    }

    const { email, business_name, business_description, business_address, gstin, full_name, phone, invitation_id } = payload

    if (!email || !business_name) {
      return new Response(JSON.stringify({ error: 'Email and Business Name are required' }), { status: 400, headers: corsHeaders(origin) })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: corsHeaders(origin) })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const normalizedEmail = email.trim().toLowerCase()

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    let userId: string | null = null

    if (existingProfile) {
      userId = existingProfile.id

      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existingVendor) {
        await supabase
          .from('vendors')
          .update({
            business_name: business_name.trim(),
            business_description: business_description?.trim() || null,
            business_address: business_address?.trim() || null,
            gstin: gstin?.trim() || null,
            is_approved: true,
            is_active: true,
          })
          .eq('id', existingVendor.id)

        if (invitation_id) {
          await supabase
            .from('vendor_invitations')
            .update({ status: 'linked', linked_user_id: userId, accepted_at: new Date().toISOString() })
            .eq('id', invitation_id)
        }

        return new Response(JSON.stringify({ ok: true, userId, message: 'Vendor updated' }), { status: 200, headers: corsHeaders(origin) })
      }
    }

    const generatedPassword = existingProfile ? null : generatePassword()

    if (!existingProfile) {
      const { data: createdUser, error: createErr } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: generatedPassword!,
        email_confirm: true,
        user_metadata: { full_name: full_name || business_name, phone: phone || null },
      })

      if (createErr) {
        if (createErr.message?.toLowerCase().includes('already exists')) {
          return new Response(JSON.stringify({ error: `User with email ${normalizedEmail} already exists` }), { status: 400, headers: corsHeaders(origin) })
        }
        throw createErr
      }

      userId = createdUser.user?.id
      if (!userId) throw new Error('Failed to create user')

      await supabase.from('profiles').upsert({
        id: userId,
        full_name: full_name || business_name,
        phone: phone || null,
        email: normalizedEmail,
        is_verified: true,
      }, { onConflict: 'id' })
    }

    await supabase.from('vendors').insert({
      user_id: userId,
      business_name: business_name.trim(),
      business_description: business_description?.trim() || null,
      business_address: business_address?.trim() || null,
      gstin: gstin?.trim() || null,
      is_approved: true,
      is_active: true,
    })

    await supabase.from('user_roles').insert({ user_id: userId, role: 'vendor' as any })

    if (invitation_id) {
      await supabase
        .from('vendor_invitations')
        .update({ status: 'linked', linked_user_id: userId, accepted_at: new Date().toISOString() })
        .eq('id', invitation_id)
    }

    console.log('Vendor created successfully:', userId)

    // Prepare email data for async sending
    const shouldSendEmail = !existingProfile && generatedPassword
    const emailData = shouldSendEmail ? {
      to: normalizedEmail,
      fullName: full_name || business_name,
      password: generatedPassword,
      businessName: business_name,
      businessDescription: business_description,
      businessAddress: business_address,
      gstin: gstin,
    } : null

    // Return success response immediately (don't wait for email)
    const response = new Response(JSON.stringify({
      ok: true,
      userId,
      message: 'Vendor account created successfully'
    }), { status: 200, headers: corsHeaders(origin) })

    // Send email asynchronously in background (fire-and-forget)
    if (emailData) {
      const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
      const smtpPort = Number(Deno.env.get('SMTP_PORT') || '587')
      const smtpUser = Deno.env.get('SMTP_USER')
      const smtpPass = Deno.env.get('SMTP_PASS')
      const senderEmail = Deno.env.get('SMTP_SENDER_EMAIL') || smtpUser
      const appUrl = Deno.env.get('APP_URL') || 'https://www.kasshit.in'

      if (smtpUser && smtpPass) {
        // Send email in background without blocking response
        (async () => {
          try {
            const emailBody = `
═══════════════════════════════════════════════════════════
                    KASSH.IT MARKETPLACE
               Your Trusted E-Commerce Platform
═══════════════════════════════════════════════════════════

Dear ${emailData.fullName},

🎊 Congratulations! Your vendor account has been successfully created.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Email (Login ID): ${emailData.to}
   Password:         ${emailData.password}

   🔗 Vendor Login:  ${appUrl}/vendor/auth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 YOUR BUSINESS DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Business Name: ${emailData.businessName}
${emailData.businessDescription ? `   Description:   ${emailData.businessDescription}` : ''}
${emailData.businessAddress ? `   Address:       ${emailData.businessAddress}` : ''}
${emailData.gstin ? `   GSTIN:         ${emailData.gstin}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔐 Login to your vendor dashboard using the credentials above
2. 🔑 Change your password immediately for security
3. 📦 Add your first product to start selling
4. 📊 Monitor your orders and sales from the dashboard
5. 🚚 Coordinate deliveries with our delivery partners

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT SECURITY NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✓ Change your password after first login
   ✓ Never share your credentials with anyone
   ✓ Use a strong, unique password

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📧 Email:   kasshit_1@zohomail.in
   🌐 Website: https://www.kasshit.in

═══════════════════════════════════════════════════════════

Thank you for partnering with Kassh.IT!

Best regards,
Kassh.IT Team

═══════════════════════════════════════════════════════════
© 2025 Kassh.IT - Your Trusted Marketplace
═══════════════════════════════════════════════════════════
            `.trim()

            await sendEmailViaSMTP(
              emailData.to,
              '🎉 Welcome to Kassh.IT - Your Vendor Account is Ready!',
              emailBody,
              {
                host: smtpHost,
                port: smtpPort,
                username: smtpUser,
                password: smtpPass,
                from: senderEmail,
              }
            )

            console.log('✅ Vendor credentials email sent successfully to:', emailData.to)
          } catch (emailError: any) {
            console.error('❌ Failed to send email:', emailError)
            // Email failure doesn't affect vendor creation success
          }
        })() // Fire-and-forget async IIFE
      } else {
        console.warn('⚠️ SMTP not configured - email not sent')
      }
    }

    return response
  } catch (e) {
    const origin = req.headers.get('origin') ?? undefined
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error('Error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400, headers: corsHeaders(origin) })
  }
})
