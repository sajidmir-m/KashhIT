// Supabase Edge Function: create-delivery-partner
// Admin-only: creates (or resets) a delivery partner login (email + generated password),
// ensures delivery role + delivery_partners row, and emails credentials via SMTP.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

type CreateDeliveryPartnerPayload = {
  email: string
  full_name?: string
  phone?: string | null
  vehicle_type?: string | null
  vehicle_number?: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

async function requireAdmin(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    throw new Error('Server configuration error (missing Supabase env vars)')
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const serviceClient = createClient(supabaseUrl, serviceKey)
  const { data: roles, error: rolesError } = await serviceClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)

  if (rolesError) throw rolesError
  const isAdmin = (roles || []).some((r: any) => r.role === 'admin')
  if (!isAdmin) {
    throw new Error('Forbidden')
  }

  return { serviceClient, requesterUserId: user.id }
}

async function sendCredentialsEmail(params: {
  to: string
  fullName: string
  password: string
  appUrl: string
}) {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const smtpPort = Number(Deno.env.get('SMTP_PORT') || '587')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')
  const senderEmail = Deno.env.get('SMTP_SENDER_EMAIL') || smtpUser
  const senderName = Deno.env.get('SMTP_SENDER_NAME') || 'Kassh.IT'

  if (!smtpUser || !smtpPass || !senderEmail) {
    throw new Error('SMTP not configured')
  }

  const client = new SmtpClient()
  await client.connectTLS({
    hostname: smtpHost,
    port: smtpPort,
    username: smtpUser,
    password: smtpPass,
  })

  const subject = `Kassh.IT Delivery Partner Login Credentials`
  const body = [
    `Hi ${params.fullName},`,
    '',
    'Your Delivery Partner account has been created by Admin.',
    '',
    `Login URL: ${params.appUrl}/auth`,
    `Email: ${params.to}`,
    `Password: ${params.password}`,
    '',
    `After login, open: ${params.appUrl}/delivery`,
    '',
    `Support: kasshit_1@zohomail.in`,
    '',
    'Thanks,',
    'Kassh.IT',
  ].join('\n')

  await client.send({
    from: `${senderName} <${senderEmail}>`,
    to: params.to,
    subject,
    content: body,
  })
  await client.close()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { serviceClient } = await requireAdmin(authHeader)

    const payload = (await req.json()) as CreateDeliveryPartnerPayload
    const email = payload.email?.trim()?.toLowerCase()
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fullName = (payload.full_name || 'Delivery Partner').trim()
    const phone = payload.phone?.trim() || null
    const vehicleType = payload.vehicle_type?.trim() || null
    const vehicleNumber = payload.vehicle_number?.trim() || null

    const password = generatePassword()

    // 1) Create user (or reset password if exists)
    const { data: usersList, error: listErr } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1, email })
    if (listErr) throw listErr

    const existing = usersList?.users?.[0]
    let userId: string | null = null

    if (existing) {
      const { error: updErr } = await serviceClient.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone },
      })
      if (updErr) throw updErr
      userId = existing.id
    } else {
      const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone },
      })
      if (createErr) throw createErr
      userId = created.user?.id ?? null
    }

    if (!userId) throw new Error('Failed to ensure user')

    // 2) Ensure profile
    await serviceClient.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone,
      is_verified: true,
      // @ts-ignore
      email,
    }, { onConflict: 'id' })

    // 3) Ensure delivery_partners row
    const { data: partner } = await serviceClient
      .from('delivery_partners')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!partner) {
      const { error: partnerErr } = await serviceClient.from('delivery_partners').insert({
        user_id: userId,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        is_verified: true,
        is_active: true,
      })
      if (partnerErr) throw partnerErr
    } else {
      // Keep vehicle info updated if provided
      const updates: any = {}
      if (vehicleType) updates.vehicle_type = vehicleType
      if (vehicleNumber) updates.vehicle_number = vehicleNumber
      if (Object.keys(updates).length > 0) {
        await serviceClient.from('delivery_partners').update(updates).eq('user_id', userId)
      }
    }

    // 4) Ensure delivery role
    const { data: existingRole } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'delivery')
      .limit(1)
    if (!existingRole || existingRole.length === 0) {
      const { error: roleErr } = await serviceClient.from('user_roles').insert({ user_id: userId, role: 'delivery' as any })
      if (roleErr) throw roleErr
    }

    // 5) If an application exists for this email, link it (cleanup old flow)
    await serviceClient
      .from('delivery_applications')
      .update({ status: 'linked', linked_user_id: userId })
      .eq('email', email)

    const appUrl = (Deno.env.get('APP_URL') || 'https://www.kasshit.in').replace(/\/+$/, '')

    // 6) Email credentials
    await sendCredentialsEmail({ to: email, fullName, password, appUrl })

    return new Response(JSON.stringify({ ok: true, userId, password }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message || e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})


