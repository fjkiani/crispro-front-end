# Render Environment Variables - Rebuild Required

**Issue**: Environment variables are set in Render but app still shows "Supabase not configured"  
**Root Cause**: Vite requires environment variables at **BUILD TIME**, not just runtime

---

## 🔧 CRITICAL FIX

**Vite embeds environment variables during the BUILD process.** Simply adding them to Render won't work - you must **REBUILD** the service.

### **Steps to Fix**:

1. **Verify Environment Variables** (Already Done ✅):
   - `VITE_SUPABASE_URL` = `https://xfhiwodulrbbtfcqneqt.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Trigger Manual Rebuild**:
   - Go to Render Dashboard
   - Select your frontend service
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - OR click **"Clear build cache"** then **"Deploy latest commit"**

3. **Wait for Build to Complete**:
   - Build typically takes 2-5 minutes
   - Watch the build logs to ensure it completes successfully

4. **Verify After Deployment**:
   - Open browser console
   - Look for: `🔍 Supabase Config Check: { isEnabled: true }`
   - If still `false`, check build logs for errors

---

## 🐛 DEBUGGING

### **Check Build Logs**:

In Render dashboard, check the build logs for:
```
🔍 Supabase Config Check: {
  hasUrl: true,
  hasKey: true,
  isEnabled: true
}
```

### **If Still Not Working**:

1. **Clear Build Cache**:
   - Render Dashboard → Your Service → Settings
   - Click "Clear build cache"
   - Redeploy

2. **Verify Variable Names**:
   - Must start with `VITE_` prefix
   - No typos: `VITE_SUPABASE_URL` (not `VITE_SUPABASE_URLS`)

3. **Check Build Command**:
   - Ensure build command includes: `npm run build` or `vite build`
   - Environment variables are injected during this step

---

## 📋 RENDER BUILD PROCESS

1. **Build Phase** (where env vars are embedded):
   ```bash
   npm install
   npm run build  # <-- Vite reads VITE_* vars here
   ```

2. **Deploy Phase**:
   ```bash
   # Built files are served
   # Runtime env vars won't work for Vite
   ```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Environment variables set in Render dashboard
- [ ] Variables start with `VITE_` prefix
- [ ] Manual rebuild triggered
- [ ] Build completed successfully
- [ ] Browser console shows `isEnabled: true`
- [ ] Login works without "Supabase not configured" error

---

## 🚨 IMPORTANT

**After adding/changing environment variables in Render, you MUST rebuild the service.**  
Simply redeploying won't work - Vite needs the variables during the build process.

---

**Status**: ⚠️ **REBUILD REQUIRED**  
**Action**: Trigger manual rebuild in Render dashboard
