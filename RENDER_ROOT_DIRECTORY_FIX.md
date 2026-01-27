# CRITICAL: Render Root Directory Fix

## The Problem

Render is looking for `package.json` in `/opt/render/project/src/package.json` but it's actually at `/opt/render/project/package.json`.

This means **Root Directory is set to `src`** in your Render dashboard.

## Solution: Clear Root Directory in Render Dashboard

### Step-by-Step Instructions:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in to your account

2. **Navigate to Your Service**
   - Click on your static site service (likely named `crispro-front-end-22` or similar)

3. **Open Settings**
   - Click the **"Settings"** tab (or gear icon) at the top

4. **Find "Build & Deploy" Section**
   - Scroll down to find the **"Build & Deploy"** section

5. **Locate "Root Directory" Field**
   - Look for a field labeled **"Root Directory"** or **"Build Root Directory"**
   - It may currently show: `src` or `./src`

6. **CLEAR THE FIELD**
   - **Delete everything** in that field
   - Leave it **completely empty/blank**
   - Do NOT enter `.` or `/` or anything else

7. **Save Changes**
   - Click **"Save Changes"** button

8. **Trigger New Deployment**
   - Go to **"Manual Deploy"** → **"Deploy latest commit"**
   - Or wait for automatic redeploy

## Alternative: If You Can't Find the Setting

If you cannot find the Root Directory setting:

1. **Delete and Recreate the Service**
   - Delete the current static site service
   - Create a new one with the same repository
   - **DO NOT set Root Directory** during creation
   - Leave it blank

2. **Or Use the Build Script Workaround**
   - The `build.sh` script I created will auto-detect the correct directory
   - Change Build Command in Render to: `bash build.sh`

## Verification

After fixing, the build log should show:
```
✅ Found package.json in current directory
📦 Building from: /opt/render/project
```

NOT:
```
❌ ERROR: Could not find package.json
path /opt/render/project/src/package.json
```

## Still Having Issues?

If the Root Directory field doesn't exist or you can't find it:
- It might be under a different name: "Build Directory", "Working Directory", or "Base Directory"
- Check all tabs: Settings, Environment, Build & Deploy
- Take a screenshot of your Settings page and share it
