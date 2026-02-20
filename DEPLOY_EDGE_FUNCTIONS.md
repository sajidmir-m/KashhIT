# Deploy Edge Functions to Supabase

## Issue
If you're getting the error: `FunctionsFetchError: Failed to send a request to the Edge Function`, it means the edge function is not deployed to Supabase.

## Solution: Deploy the `send-otp` Function

### Prerequisites
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Supabase Dashboard → Settings → General → Reference ID)

### Deploy the Function

1. **Deploy send-otp function:**
   ```bash
   supabase functions deploy send-otp
   ```

2. **Deploy verify-otp-signup function:**
   ```bash
   supabase functions deploy verify-otp-signup
   ```

### Set Environment Variables

After deploying, set the SMTP environment variables in Supabase Dashboard:

1. Go to **Supabase Dashboard** → **Edge Functions** → **send-otp** → **Settings**
2. Add these environment variables:

   ```
   SMTP_HOST=smtp.zoho.in
   SMTP_PORT=587
   SMTP_USER=kasshit_1@zohomail.in
   SMTP_PASS=your_zoho_app_password
   SMTP_SENDER_EMAIL=kasshit_1@zohomail.in
   SMTP_SENDER_NAME=Kassh.IT
   ```

3. Repeat for **verify-otp-signup** function (it may need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` which are usually auto-set)

### Alternative: Deploy All Functions

To deploy all edge functions at once:

```bash
supabase functions deploy
```

### Verify Deployment

1. Check Supabase Dashboard → Edge Functions
2. You should see `send-otp` and `verify-otp-signup` listed
3. Test by trying to sign up - OTP should be sent via email

### Troubleshooting

**If deployment fails:**
- Ensure you're logged in: `supabase login`
- Check project link: `supabase projects list`
- Verify function files exist in `supabase/functions/send-otp/`

**If OTP still doesn't arrive:**
- Check function logs: `supabase functions logs send-otp`
- Verify SMTP credentials in environment variables
- Check Zoho Mail settings (ensure app password is correct)

### Quick Deploy Script

Create a `deploy-functions.sh` file:

```bash
#!/bin/bash
echo "Deploying send-otp function..."
supabase functions deploy send-otp

echo "Deploying verify-otp-signup function..."
supabase functions deploy verify-otp-signup

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```

