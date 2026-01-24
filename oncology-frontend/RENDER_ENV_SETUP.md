# Render Environment Variables Setup

## Supabase Configuration

To enable Supabase authentication, you need to set the following environment variables in your Render dashboard:

### Required Variables:

1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Find it in: Supabase Dashboard → Settings → API → Project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Find it in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### How to Set Environment Variables in Render:

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your static site service
3. Go to **Settings** → **Environment**
4. Click **Add Environment Variable**
5. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
6. Click **Add Environment Variable** again:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
7. Click **Save Changes**
8. **Redeploy** your service (Render will automatically redeploy when you save)

### Important Notes:

- ⚠️ **VITE_** prefix is required! Vite only exposes environment variables that start with `VITE_`
- After setting variables, you must **redeploy** for changes to take effect
- The values should **NOT** have quotes around them
- No trailing spaces

### Verification:

After redeploying, check the browser console. You should see:
```
🔍 Supabase Config Check: {
  hasUrl: true,
  hasKey: true,
  ...
}
✅ Supabase client initialized successfully
```

If you see "Supabase not configured", the environment variables are not set correctly.
