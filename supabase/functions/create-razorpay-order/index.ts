// Supabase Edge Function: create-razorpay-order
// Creates a Razorpay order and returns order details for client-side checkout

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type CreateOrderPayload = {
  amount: number // Amount in paise (smallest currency unit)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get auth token from headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header found')
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseAnonKey 
      })
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'Missing Supabase credentials' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'User not found' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    let requestBody: CreateOrderPayload
    try {
      requestBody = await req.json() as CreateOrderPayload
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: 'Failed to parse JSON' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { amount, currency = 'INR', receipt, notes } = requestBody

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be greater than 0' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Razorpay credentials from environment
    // Trim whitespace to avoid issues with copy-paste
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim()
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim()

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials:', { 
        hasKeyId: !!razorpayKeyId, 
        hasKeySecret: !!razorpayKeySecret 
      })
      return new Response(
        JSON.stringify({ 
          error: 'Razorpay credentials not configured',
          details: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Edge Function secrets'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate credential format
    if (razorpayKeyId.length < 10 || razorpayKeySecret.length < 10) {
      console.error('Invalid Razorpay credential format:', {
        keyIdLength: razorpayKeyId.length,
        keySecretLength: razorpayKeySecret.length
      })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Razorpay credentials format',
          details: 'Key ID and Key Secret should be valid strings. Please check your Razorpay dashboard.'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate Key ID format (should start with rzp_test_ or rzp_live_)
    if (!razorpayKeyId.startsWith('rzp_test_') && !razorpayKeyId.startsWith('rzp_live_')) {
      console.error('Invalid Razorpay Key ID format:', {
        keyId: razorpayKeyId.substring(0, 20) + '...',
        keyIdLength: razorpayKeyId.length
      })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Razorpay Key ID format',
          details: 'Key ID should start with "rzp_test_" (test mode) or "rzp_live_" (live mode). Please check your Razorpay dashboard.'
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    }

    // Log credential info (without exposing secrets)
    console.log('Creating Razorpay order with data:', {
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      hasKeyId: !!razorpayKeyId,
      keyIdLength: razorpayKeyId?.length || 0,
      keyIdPrefix: razorpayKeyId ? razorpayKeyId.substring(0, 8) + '...' : 'N/A',
      hasKeySecret: !!razorpayKeySecret,
      keySecretLength: razorpayKeySecret?.length || 0,
      keySecretPrefix: razorpayKeySecret ? razorpayKeySecret.substring(0, 8) + '...' : 'N/A',
    })

    // Make request to Razorpay API
    // Razorpay uses Basic Auth with key_id:key_secret
    // Format: Authorization: Basic base64(key_id:key_secret)
    const credentials = `${razorpayKeyId}:${razorpayKeySecret}`
    const authString = btoa(credentials)
    
    console.log('Razorpay auth info:', {
      credentialsLength: credentials.length,
      authStringLength: authString.length,
      authStringPrefix: authString.substring(0, 10) + '...',
    })
    
    try {
      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
        body: JSON.stringify(orderData),
      })

      if (!razorpayResponse.ok) {
        let errorData: any
        try {
          errorData = await razorpayResponse.json()
        } catch (e) {
          const text = await razorpayResponse.text()
          errorData = { error: { description: text || 'Unknown error' } }
        }
        
        console.error('Razorpay API error:', {
          status: razorpayResponse.status,
          statusText: razorpayResponse.statusText,
          error: errorData,
        })
        
        return new Response(
          JSON.stringify({ 
            error: errorData.error?.description || 'Failed to create Razorpay order',
            code: errorData.error?.code,
            details: `Razorpay API returned ${razorpayResponse.status}: ${razorpayResponse.statusText}`
          }),
          { status: razorpayResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const razorpayOrder = await razorpayResponse.json()
      console.log('Razorpay order created successfully:', { orderId: razorpayOrder.id })
      
      return new Response(
        JSON.stringify({
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: razorpayKeyId, // Return key_id for client-side checkout
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (fetchError) {
      console.error('Fetch error calling Razorpay API:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to connect to Razorpay API',
          details: fetchError instanceof Error ? fetchError.message : String(fetchError)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Unexpected error in Edge Function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

