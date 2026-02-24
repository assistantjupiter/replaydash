#!/bin/bash

# ReplayDash ECS Rollback Script
# Usage: ./scripts/rollback-ecs.sh [revision-number]

set -e

REVISION=${1}
ENVIRONMENT="production"
REGION="us-east-1"
CLUSTER_NAME="replaydash-$ENVIRONMENT-cluster"
SERVICE_NAME="replaydash-$ENVIRONMENT-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔄 ECS Rollback Tool"
echo "================================================"

if [ -z "$REVISION" ]; then
    echo "Available task definition revisions:"
    echo ""
    
    aws ecs list-task-definitions \
      --family-prefix replaydash-$ENVIRONMENT-api \
      --sort DESC \
      --max-items 10 \
      --region $REGION \
      --query 'taskDefinitionArns[]' \
      --output table
    
    echo ""
    echo "Current task definition:"
    CURRENT=$(aws ecs describe-services \
      --cluster $CLUSTER_NAME \
      --services $SERVICE_NAME \
      --region $REGION \
      --query 'services[0].taskDefinition' \
      --output text)
    
    echo -e "${YELLOW}$CURRENT${NC}"
    echo ""
    echo "Usage: $0 <revision-number>"
    echo "Example: $0 123"
    exit 0
fi

TASK_DEF="replaydash-$ENVIRONMENT-api:$REVISION"

echo "Rollback Details:"
echo "  Environment: $ENVIRONMENT"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  Target Revision: $TASK_DEF"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback to revision $REVISION? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled.${NC}"
    exit 0
fi

echo ""
echo "Rolling back to revision $REVISION..."

aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEF \
  --force-new-deployment \
  --region $REGION \
  --no-cli-pager > /dev/null

echo -e "${GREEN}✓ Rollback initiated${NC}"

echo ""
echo -e "${YELLOW}Waiting for service to stabilize (this may take a few minutes)...${NC}"

aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

echo -e "${GREEN}✓ Service is stable${NC}"

# Get service status
echo ""
echo "Service status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,TaskDef:taskDefinition}' \
  --output table

# Test health endpoint
echo ""
echo "Testing health endpoint..."
sleep 10

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.replaydash.com/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed with status $HEALTH_STATUS${NC}"
    echo "  Check logs: aws logs tail /ecs/$CLUSTER_NAME-api --follow"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo ""
echo "Rolled back to: $TASK_DEF"
echo ""
