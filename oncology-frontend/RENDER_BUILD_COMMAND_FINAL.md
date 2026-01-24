# Final Render Build Command

## Use This Build Command

Copy and paste this EXACT command into Render's Build Command field:

```bash
echo "Current dir: $(pwd)" && ls -la && if [ -f package.json ]; then echo "Found package.json in current dir" && npm install && npm run build; elif [ -f ../package.json ]; then echo "Found package.json in parent" && cd .. && npm install && npm run build; elif [ -f ../../package.json ]; then echo "Found package.json in grandparent" && cd ../.. && npm install && npm run build; else echo "Searching for package.json..." && PKG_PATH=$(find . -name "package.json" -type f 2>/dev/null | head -1) && if [ -n "$PKG_PATH" ]; then echo "Found at: $PKG_PATH" && cd "$(dirname "$PKG_PATH")" && npm install && npm run build; else echo "ERROR: package.json not found anywhere" && pwd && ls -la && exit 1; fi; fi
```

## What This Does

1. Shows current directory and contents (for debugging)
2. Checks current directory for package.json
3. Checks parent directory
4. Checks grandparent directory
5. Uses `find` to search the entire repo if needed
6. Changes to the directory containing package.json
7. Runs npm install and build

This should work regardless of Root Directory setting.
