#!/bin/bash

# ReplayDash Logs Viewer
# Usage: ./scripts/logs.sh [environment] [options]
# Example: ./scripts/logs.sh production --follow
# Example: ./scripts/logs.sh production --filter "ERROR"

set -e

ENVIRONMENT=${1:-production}
shift || true  # Remove first argument

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
LOG_GROUP="/ecs/replaydash-$ENVIRONMENT-api"

echo "📋 Viewing logs for $ENVIRONMENT environment"
echo "Log group: $LOG_GROUP"
echo "================================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Parse options
FOLLOW=""
FILTER=""
SINCE="30m"

while [[ $# -gt 0 ]]; do
    case $1 in
        --follow|-f)
            FOLLOW="--follow"
            shift
            ;;
        --filter)
            FILTER="--filter-pattern $2"
            shift 2
            ;;
        --since)
            SINCE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [environment] [--follow] [--filter PATTERN] [--since TIME]"
            exit 1
            ;;
    esac
done

# Tail logs
if [ -n "$FILTER" ]; then
    echo "Filtering for: $FILTER"
fi

if [ -n "$FOLLOW" ]; then
    echo "Following logs (press Ctrl+C to stop)..."
else
    echo "Showing logs from last $SINCE..."
fi

echo ""

aws logs tail $LOG_GROUP \
    $FOLLOW \
    $FILTER \
    --since $SINCE \
    --format short
