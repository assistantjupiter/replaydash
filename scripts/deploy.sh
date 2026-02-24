#!/bin/bash

# ReplayDash API Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e

ENVIRONMENT=${1:-production}
REGION="us-east-1"
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🚀 Deploying ReplayDash API to $ENVIRONMENT"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Get infrastructure details from Terraform
cd "$PROJECT_ROOT/infrastructure/terraform"

if [ ! -f "terraform.tfstate" ]; then
    echo -e "${RED}❌ Terraform state not found. Please run 'terraform apply' first.${NC}"
    exit 1
fi

echo "Getting infrastructure details..."
ECR_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name 2>/dev/null || echo "")
SERVICE_NAME=$(terraform output -raw ecs_service_name 2>/dev/null || echo "")

if [ -z "$ECR_URL" ] || [ -z "$CLUSTER_NAME" ] || [ -z "$SERVICE_NAME" ]; then
    echo -e "${RED}❌ Could not get infrastructure details from Terraform.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Infrastructure details loaded${NC}"
echo "  ECR: $ECR_URL"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"

# Build Docker image
cd "$PROJECT_ROOT"
echo ""
echo "Building Docker image..."
docker build -t replaydash-api:latest -f packages/api/Dockerfile .
echo -e "${GREEN}✓ Docker image built${NC}"

# Login to ECR
echo ""
echo "Logging in to ECR..."
aws ecr get-login-password --region $REGION | \
    docker login --username AWS --password-stdin $(echo $ECR_URL | cut -d'/' -f1)
echo -e "${GREEN}✓ Logged in to ECR${NC}"

# Tag and push image
echo ""
echo "Tagging and pushing Docker image..."
VERSION="v$(date +%Y%m%d-%H%M%S)"
docker tag replaydash-api:latest $ECR_URL:latest
docker tag replaydash-api:latest $ECR_URL:$VERSION

docker push $ECR_URL:latest
docker push $ECR_URL:$VERSION
echo -e "${GREEN}✓ Image pushed to ECR${NC}"
echo "  Tags: latest, $VERSION"

# Run database migrations
echo ""
echo "Running database migrations..."
bash "$PROJECT_ROOT/scripts/migrate-database.sh" $ENVIRONMENT
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Deploy to ECS
echo ""
echo "Deploying to ECS..."
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $REGION \
    --no-cli-pager > /dev/null

echo -e "${GREEN}✓ Deployment initiated${NC}"

# Wait for deployment
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
    --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' \
    --output table

# Test health endpoint
echo ""
API_ENDPOINT=$(cd "$PROJECT_ROOT/infrastructure/terraform" && terraform output -raw api_endpoint)
echo "Testing health endpoint: $API_ENDPOINT/health"

sleep 10  # Give the service a moment to start

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_ENDPOINT/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Health check returned status $HEALTH_STATUS${NC}"
    echo "  Check logs: aws logs tail /ecs/$SERVICE_NAME --follow"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Deployed version: $VERSION"
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Next steps:"
echo "  - Test the API: curl $API_ENDPOINT/health"
echo "  - View logs: aws logs tail /ecs/$CLUSTER_NAME-api --follow"
echo "  - Monitor: Visit CloudWatch Dashboard"
echo ""
