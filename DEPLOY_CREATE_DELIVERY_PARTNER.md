# Deploy `create-delivery-partner` Edge Function to Supabase

## Quick Steps

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```
This will open a browser window for authentication.

### 3. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
**To find your Project Ref:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **General**
- Copy the **Reference ID** (it looks like: `abcdefghijklmnop`)

### 4. Deploy the Function
```bash
supabase functions deploy create-delivery-partner
```

### 5. Set Environment Variables

After deployment, you need to set environment variables in Supabase Dashboard:

1. Go to **Supabase Dashboard** → **Edge Functions** → **create-delivery-partner** → **Settings**
2. Click **Add Secret** and add these variables:

```
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_USER=kasshit_1@zohomail.in
SMTP_PASS=your_zoho_app_password
SMTP_SENDER_EMAIL=kasshit_1@zohomail.in
SMTP_SENDER_NAME=Kassh.IT
APP_URL=https://www.kasshit.in
```

**Note:** The following are automatically set by Supabase (you don't need to add them):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 6. Verify Deployment

1. Check **Supabase Dashboard** → **Edge Functions**
2. You should see `create-delivery-partner` in the list
3. Test by going to Admin Dashboard → Delivery tab → Add Delivery Partner form

---

## Alternative: Deploy All Functions at Once

If you want to deploy all edge functions:

```bash
supabase functions deploy
```

This will deploy:
- `send-otp`
- `verify-otp-signup`
- `create-delivery-partner`
- `create-vendor`
- `send-order-email`
- `create-razorpay-order`
- `approve-delivery`

---

## Troubleshooting

### Error: "Not logged in"
```bash
supabase login
```

### Error: "Project not linked"
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Error: "Function not found"
Make sure the function exists in `supabase/functions/create-delivery-partner/index.ts`

### Check Function Logs
```bash
supabase functions logs create-delivery-partner
```

### Verify Environment Variables
1. Go to **Supabase Dashboard** → **Edge Functions** → **create-delivery-partner** → **Settings**
2. Check that all required secrets are set

---

## Quick Deploy Script

Create a file `deploy-delivery-partner.sh`:

```bash
#!/bin/bash
echo "Deploying create-delivery-partner function..."
supabase functions deploy create-delivery-partner
echo "✅ Deployment complete!"
echo "⚠️  Don't forget to set environment variables in Supabase Dashboard!"
```

Make it executable:
```bash
chmod +x deploy-delivery-partner.sh
./deploy-delivery-partner.sh
```

---

## After Deployment

Once deployed, the Admin Dashboard's "Add Delivery Partner" form will work. The function will:
1. Create/reset the delivery partner's account
2. Assign the `delivery` role
3. Create/update the `delivery_partners` record
4. Send login credentials via email

---

## Need Help?

- Check Supabase Docs: https://supabase.com/docs/guides/functions
- View function logs: `supabase functions logs create-delivery-partner`
- Check Supabase Dashboard → Edge Functions → create-delivery-partner → Logs

