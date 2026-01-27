#!/bin/bash
# Build script that works regardless of Root Directory setting
# This script ensures we're in the correct directory before building

set -e  # Exit on error

echo "🔍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la | head -10

# Try to find package.json - check multiple possible locations
BUILD_DIR=""

# Check current directory
if [ -f "package.json" ]; then
  BUILD_DIR="$(pwd)"
  echo "✅ Found package.json in current directory: $BUILD_DIR"
# Check parent directory (if Root Directory is set to src)
elif [ -f "../package.json" ]; then
  BUILD_DIR="$(cd .. && pwd)"
  echo "⚠️  package.json found in parent directory: $BUILD_DIR"
# Check grandparent (if nested deeper)
elif [ -f "../../package.json" ]; then
  BUILD_DIR="$(cd ../.. && pwd)"
  echo "⚠️  package.json found in grandparent directory: $BUILD_DIR"
# Check if we're in a subdirectory and need to go to repo root
elif [ -d "../.git" ] && [ -f "../package.json" ]; then
  BUILD_DIR="$(cd .. && pwd)"
  echo "⚠️  Found .git in parent, using: $BUILD_DIR"
else
  echo "❌ ERROR: Could not find package.json"
  echo "Searched in:"
  echo "  - $(pwd)"
  [ -d ".." ] && echo "  - $(cd .. && pwd)"
  [ -d "../.." ] && echo "  - $(cd ../.. && pwd)"
  echo ""
  echo "Current directory contents:"
  ls -la
  exit 1
fi

# Change to build directory
cd "$BUILD_DIR"
echo ""
echo "📦 Building from: $(pwd)"
echo "📄 package.json location: $(pwd)/package.json"
echo ""

# Verify package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: package.json not found in $BUILD_DIR"
  exit 1
fi

# Install dependencies
echo "🔧 Installing dependencies..."
npm install

# Build
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Build complete!"
echo "📁 Build output should be in: $(pwd)/dist"

# Verify dist exists
if [ -d "dist" ]; then
  echo "✅ dist directory found with $(ls -1 dist | wc -l) items"
else
  echo "⚠️  WARNING: dist directory not found!"
  exit 1
fi
