# Render Deployment Configuration

## Critical Settings for Static Site

The `package.json` is at the **repository root**, not in a subdirectory.

### Required Render Dashboard Settings:

1. **Root Directory**: Leave **EMPTY** (or set to `.`)
   - ❌ DO NOT set to `src` or any subdirectory
   - ✅ Should be empty/blank

2. **Build Command**: `npm install && npm run build`

3. **Publish Directory**: `dist`

4. **Environment**: Static Site

### Current Error Fix:

If you see: `Could not read package.json: Error: ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`

This means Root Directory is set to `src`. **Change it to empty/blank** in the Render dashboard.

### Steps:

1. Go to your Render service dashboard
2. Click "Settings"
3. Scroll to "Build & Deploy"
4. Find "Root Directory" field
5. **Clear it** (make it empty/blank)
6. Save changes
7. Manually trigger a new deployment

The repository structure is:
```
/
├── package.json  ← This is at the root
├── vite.config.js
├── src/
└── dist/  ← Build output goes here
```
