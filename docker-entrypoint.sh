#!/bin/sh
set -e

# Change to app directory
cd /app

# Verify npm is available (comes with node image)
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ Error: npm is not installed or not in PATH"
  exit 1
fi

# Verify pnpm is available, install if missing
if ! command -v pnpm >/dev/null 2>&1; then
  echo "📦 pnpm not found, installing globally..."
  npm install -g pnpm@10.4.1
  echo "✅ pnpm installed"
fi

# Verify package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in /app"
  exit 1
fi

# Install dependencies if node_modules is empty or missing
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules is empty or missing, installing dependencies..."
  pnpm install --no-frozen-lockfile
  echo "✅ Dependencies installed"
else
  echo "✅ node_modules already exists, skipping installation"
fi

# Execute the command passed as arguments
exec "$@"

