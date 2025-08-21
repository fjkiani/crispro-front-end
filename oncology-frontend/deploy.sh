#!/bin/bash

# Oncology Frontend Deployment Script
echo "🚀 Deploying Oncology Frontend to Vercel..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure your environment variables."
    echo "cp env.example .env"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment complete!"
echo "🔗 Your frontend will be available at the Vercel URL shown above"
echo "📝 Make sure your backend URL is configured in the .env file" 