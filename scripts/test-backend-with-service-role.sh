#!/bin/bash

echo "🔧 Running backend tests with service role key..."
echo "=============================================="

# Load service role key from .env.local
if [ -f .env.local ]; then
    export SUPABASE_SERVICE_ROLE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2)"
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "✅ Service role key loaded from .env.local"
    else
        echo "❌ Service role key not found in .env.local"
        exit 1
    fi
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Set test environment
export NODE_ENV=test

echo "🚀 Starting backend tests..."
npm run test:backend