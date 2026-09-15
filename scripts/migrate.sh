#!/bin/bash
# ==============================================================================
# CounsConnect - Database Migration Runner
# ==============================================================================
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$REPO_DIR/supabase/migrations"

# Determine if running directly on Azure VM or locally on developer machine
if command -v docker >/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "supabase-db"; then
  IS_ON_VM=true
else
  IS_ON_VM=false
fi

run_sql() {
  local sql="$1"
  if [ "$IS_ON_VM" = true ]; then
    docker exec -i supabase-db psql -U postgres -d postgres -t -A -c "$sql"
  else
    local SSH_KEY="${COUNSCONNECT_SSH_KEY:-$HOME/.ssh/id_rsa}"
    local REMOTE="${COUNSCONNECT_VM_HOST:-localhost}"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$REMOTE" "docker exec -i supabase-db psql -U postgres -d postgres -t -A -c \"$sql\""
  fi
}

run_file() {
  local file="$1"
  if [ "$IS_ON_VM" = true ]; then
    docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file"
  else
    local SSH_KEY="${COUNSCONNECT_SSH_KEY:-$HOME/.ssh/id_rsa}"
    local REMOTE="${COUNSCONNECT_VM_HOST:-localhost}"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$REMOTE" "docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1" < "$file"
  fi
}

echo "🔍 Checking database migrations..."

# Ensure tracking table exists
run_sql "CREATE TABLE IF NOT EXISTS public._schema_migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW());" >/dev/null

# Get applied migrations
APPLIED=$(run_sql "SELECT version FROM public._schema_migrations;")

count=0
for migration in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  filename="$(basename "$migration")"
  if echo "$APPLIED" | grep -qx "$filename"; then
    continue
  fi
  echo "🚀 Applying migration: $filename..."
  run_file "$migration"
  run_sql "INSERT INTO public._schema_migrations (version) VALUES ('$filename');" >/dev/null
  echo "✅ Applied: $filename"
  count=$((count + 1))
done

if [ $count -eq 0 ]; then
  echo "✨ All migrations are up to date. (0 pending)"
else
  echo "🎉 Successfully applied $count migration(s)!"
fi
