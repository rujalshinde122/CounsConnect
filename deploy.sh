#!/bin/bash
# ==============================================================================
# CounsConnect - Fast Production Deployment Script
# Run this on your Azure VM whenever you push code changes to GitHub:
# ./deploy.sh
# ==============================================================================

set -e

echo "🚀 Starting CounsConnect Web deployment..."

# Navigate to project web-frontend directory
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR/web-frontend"

# 1. Pull latest changes from GitHub
echo "📥 Pulling latest code from origin main..."
cd "$REPO_DIR"
git pull origin main

# 2. Run any pending database migrations
echo "🗄️ Running database migrations..."
chmod +x "$REPO_DIR/scripts/migrate.sh"
"$REPO_DIR/scripts/migrate.sh"

cd "$REPO_DIR/web-frontend"

# 3. Build the optimized Next.js Docker image
# (Docker caching will make this take only ~15-25 seconds if package.json hasn't changed)
echo "🔨 Building Docker container..."
docker build -t counsconnect-web .

# 3. Swap the running container cleanly
echo "🔄 Updating running container..."
docker stop counsconnect-web 2>/dev/null || true
docker rm counsconnect-web 2>/dev/null || true

docker run -d \
  --name counsconnect-web \
  --restart always \
  -p 127.0.0.1:3000:3000 \
  counsconnect-web

echo "✨ Successfully deployed! Check your live site at:"
echo "👉 https://counsconnect.centralindia.cloudapp.azure.com"
