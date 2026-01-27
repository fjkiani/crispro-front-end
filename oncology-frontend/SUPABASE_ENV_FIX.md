# Supabase Environment Variables Fix

**Issue**: "Supabase not configured" error preventing login  
**Root Cause**: Missing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables

---

## 🔧 FIX REQUIRED

The frontend requires these environment variables to be set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📋 DEPLOYMENT PLATFORM SETUP

### **For Render.com**:

1. Go to your Render dashboard
2. Select your frontend service
3. Go to **Environment** tab
4. Add these environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **Redeploy** the service

---

## 🔍 HOW TO GET SUPABASE CREDENTIALS

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

---

## ✅ VERIFICATION

After setting environment variables, check browser console:

**Expected Log**:
```
🔍 Supabase Config Check: {
  hasUrl: true,
  hasKey: true,
  isEnabled: true
}
```

**If Still Failing**:
```
🔍 Supabase Config Check: {
  hasUrl: false,
  hasKey: false,
  isEnabled: false
}
```

---

## 🚨 IMPORTANT NOTES

1. **VITE_ prefix required**: React/Vite only exposes env vars that start with `VITE_`
2. **No quotes needed**: Don't wrap values in quotes in Render dashboard
3. **Redeploy required**: Changes only take effect after redeployment
4. **Check logs**: Browser console will show detailed config check

---

## 📝 LOCAL DEVELOPMENT

Create `.env` file in `oncology-coPilot/oncology-frontend/`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart dev server:
```bash
npm run dev
```

---

**Status**: ⚠️ **ENVIRONMENT VARIABLES NOT SET**  
**Action Required**: Add Supabase credentials to Render environment variables
