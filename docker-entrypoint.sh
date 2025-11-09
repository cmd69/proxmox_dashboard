#!/bin/sh
set -e

# Change to app directory
cd /app

# Install dependencies if node_modules is empty or missing
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules is empty, installing dependencies..."
  pnpm install --no-frozen-lockfile
  echo "✅ Dependencies installed"
else
  echo "✅ node_modules already exists, skipping installation"
fi

# Execute the command passed as arguments
exec "$@"

