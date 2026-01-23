# Render Build Command Fix

## Current Issue
Build script not found because Root Directory is set incorrectly.

## Solution: Update Build Command

In Render Dashboard → Settings → Build & Deploy → Build Command:

### Option 1: Use inline script (Recommended)
Replace the build command with:

```bash
if [ -f package.json ]; then npm install && npm run build; elif [ -f ../package.json ]; then cd .. && npm install && npm run build; else echo "ERROR: package.json not found" && exit 1; fi
```

### Option 2: Use find command
```bash
cd $(find . -name "package.json" -type f | head -1 | xargs dirname) && npm install && npm run build
```

### Option 3: Clear Root Directory (Best long-term fix)
1. Go to Settings → Build & Deploy
2. Click "Edit" next to "Root Directory"
3. **Clear the field completely** (delete any value)
4. Save Changes
5. Change Build Command back to: `npm install && npm run build`

## Why This Happens
If Root Directory is set to `src`, Render runs commands from `/opt/render/project/src/` instead of `/opt/render/project/`. The build script needs to navigate up to find `package.json`.
