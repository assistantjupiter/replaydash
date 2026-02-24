#!/bin/bash

# ReplayDash Database Migration Script
# Usage: ./scripts/migrate-database.sh [environment]
# Example: ./scripts/migrate-database.sh production

set -e

ENVIRONMENT=${1:-production}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🔄 Running database migrations for $ENVIRONMENT"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Get database URL from Secrets Manager
SECRET_NAME="replaydash-$ENVIRONMENT/db/password"
echo "Fetching database credentials from Secrets Manager..."

DB_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id $SECRET_NAME \
    --query SecretString \
    --output text 2>/dev/null) || {
    echo -e "${RED}❌ Failed to fetch secret: $SECRET_NAME${NC}"
    echo "  Make sure the secret exists and you have permission to access it."
    exit 1
}

DATABASE_URL=$(echo $DB_SECRET | jq -r .url)

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "null" ]; then
    echo -e "${RED}❌ Failed to extract database URL from secret${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database credentials retrieved${NC}"

# Export DATABASE_URL for Prisma
export DATABASE_URL

# Navigate to API directory
cd "$PROJECT_ROOT/packages/api"

# Check if Prisma is installed
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo -e "${YELLOW}⚠ Prisma not found in node_modules. Installing dependencies...${NC}"
    cd "$PROJECT_ROOT"
    npm ci
    cd "$PROJECT_ROOT/packages/api"
fi

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "Running migrations..."
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Migrations completed successfully!${NC}"

# Optional: Show database status
echo ""
echo "Database status:"
npx prisma migrate status || true

echo ""
