# ReplayDash API Deployment Guide

This guide covers the complete deployment process for the ReplayDash API to AWS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Initial Deployment](#initial-deployment)
4. [CI/CD Setup](#cicd-setup)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **AWS Account** with administrative access
- **AWS CLI** (v2.x):
  ```bash
  brew install awscli  # macOS
  aws configure
  ```
- **Terraform** (v1.0+):
  ```bash
  brew install terraform
  ```
- **Docker** (v20.x+):
  ```bash
  brew install docker
  ```
- **Node.js** (v20.x+)
- **Domain name** registered (e.g., replaydash.com)

### AWS Credentials

Configure AWS CLI with your credentials:

```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

Verify access:

```bash
aws sts get-caller-identity
```

## Infrastructure Setup

### Step 1: Configure Terraform Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region  = "us-east-1"
environment = "production"

# Database
db_instance_class = "db.t4g.medium"

# Redis
redis_node_type = "cache.t4g.micro"

# ECS
api_desired_count = 2
api_min_capacity  = 1
api_max_capacity  = 4

# Domain
domain_name = "api.replaydash.com"
cors_origin = "https://replaydash.com"

# Monitoring
alert_email = "your-email@example.com"
```

### Step 2: Initialize Terraform

```bash
terraform init
```

This will download required providers and modules.

### Step 3: Review Infrastructure Plan

```bash
terraform plan
```

Review the resources that will be created:
- VPC with public/private subnets
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- ECS Fargate cluster and service
- Application Load Balancer
- S3 bucket for session storage
- ECR repository for Docker images
- CloudWatch dashboards and alarms
- IAM roles and security groups

### Step 4: Create Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will take **15-20 minutes**.

### Step 5: Save Terraform Outputs

```bash
terraform output > outputs.txt
```

Important outputs:
- `api_endpoint`: Your API URL
- `alb_dns_name`: Load balancer DNS for Route53
- `ecr_repository_url`: Docker repository URL
- `database_endpoint`: RDS endpoint
- `redis_endpoint`: ElastiCache endpoint

## Initial Deployment

### Step 1: Configure DNS

Create a DNS record for your API domain:

**Using Route53:**

```bash
# Get ALB DNS and Zone ID
ALB_DNS=$(terraform output -raw alb_dns_name)
ALB_ZONE=$(terraform output -raw alb_zone_id)

# Create Route53 alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.replaydash.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "'$ALB_ZONE'",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

**Using Other DNS Providers:**

Create an A record (alias) pointing to the ALB DNS name.

### Step 2: Validate SSL Certificate

If Terraform created a new ACM certificate:

```bash
# Get validation records
terraform output certificate_validation_records
```

Create the CNAME records shown in your DNS provider. Wait for validation (5-30 minutes).

Check validation status:

```bash
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw certificate_arn) \
  --query 'Certificate.Status'
```

### Step 3: Build and Push Docker Image

```bash
# Navigate to project root
cd /Users/jupiter/Projects/replaydash

# Get ECR repository URL
ECR_URL=$(cd infrastructure/terraform && terraform output -raw ecr_repository_url)
REGION=$(cd infrastructure/terraform && terraform output -raw aws_region)

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $(echo $ECR_URL | cut -d'/' -f1)

# Build Docker image
docker build -t replaydash-api:latest -f packages/api/Dockerfile .

# Tag for ECR
docker tag replaydash-api:latest $ECR_URL:latest
docker tag replaydash-api:latest $ECR_URL:v1.0.0

# Push to ECR
docker push $ECR_URL:latest
docker push $ECR_URL:v1.0.0
```

### Step 4: Run Database Migrations

**Option A: Run locally (requires database access)**

```bash
# Get database URL
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id replaydash-production/db/password \
  --query SecretString \
  --output text)

export DATABASE_URL=$(echo $DB_SECRET | jq -r .url)

# Run migrations
cd packages/api
npx prisma migrate deploy
```

**Option B: Use the migration script**

```bash
./scripts/migrate-database.sh production
```

### Step 5: Deploy to ECS

```bash
# Force new deployment
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --force-new-deployment \
  --region us-east-1

# Wait for deployment to complete
aws ecs wait services-stable \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api \
  --region us-east-1
```

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://api.replaydash.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-02-24T12:00:00.000Z","uptime":123.456}

# View logs
aws logs tail /ecs/replaydash-production-api --follow

# Check service status
aws ecs describe-services \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
  --output table
```

## CI/CD Setup

### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

Required secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### Step 2: Test CI/CD Pipeline

```bash
# Push to main branch to trigger deployment
git add .
git commit -m "feat: deploy API to AWS"
git push origin main
```

The GitHub Actions workflow will:
1. Run tests
2. Build Docker image
3. Push to ECR
4. Run database migrations
5. Deploy to ECS
6. Run health checks

Monitor the deployment at:
`https://github.com/YOUR_USERNAME/replaydash/actions`

### Step 3: Set Up Branch Protection

Protect the `main` branch:

**Settings → Branches → Add rule**

- Branch name pattern: `main`
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Select: `Test API`, `Build and Push Docker Image`

## Environment Variables

### Required Environment Variables

The following variables are automatically set by Terraform:

#### Application
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `CORS_ORIGIN`: Your dashboard domain

#### Database
- `DATABASE_URL`: PostgreSQL connection string (from Secrets Manager)

#### Redis
- `REDIS_HOST`: ElastiCache endpoint
- `REDIS_PORT`: `6379`

### Adding New Environment Variables

**Option 1: Via Terraform (recommended)**

Edit `infrastructure/terraform/ecs.tf` and add to the task definition:

```hcl
environment = [
  # ... existing variables
  {
    name  = "NEW_VARIABLE"
    value = "new_value"
  }
]
```

Then apply:

```bash
cd infrastructure/terraform
terraform apply
```

**Option 2: Via AWS Console**

1. Go to ECS → Task Definitions
2. Create new revision
3. Add environment variable
4. Update service to use new revision

**Option 3: Via Secrets Manager (for sensitive data)**

```bash
# Create secret
aws secretsmanager create-secret \
  --name replaydash-production/api/api-key \
  --secret-string "your-secret-value"

# Update task definition to reference it
```

## Database Migrations

### Running Migrations

**During deployment (automatic):**

The GitHub Actions workflow runs migrations automatically.

**Manual migration:**

```bash
# Using the helper script
./scripts/migrate-database.sh production

# Or manually
export DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id replaydash-production/db/password \
  --query SecretString \
  --output text | jq -r .url)

cd packages/api
npx prisma migrate deploy
```

### Creating New Migrations

```bash
# During development
cd packages/api
npx prisma migrate dev --name add_new_feature

# Commit the migration file
git add prisma/migrations
git commit -m "feat: add new database migration"
```

### Rollback Migrations

Prisma doesn't support automated rollbacks. To revert:

1. Create a new migration that reverses the changes
2. Or restore from RDS snapshot

## Monitoring & Alerts

### CloudWatch Dashboard

Access the dashboard:

```bash
# Get dashboard URL
cd infrastructure/terraform
terraform output cloudwatch_dashboard_url
```

Or visit: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:`

### View Logs

```bash
# Real-time logs
aws logs tail /ecs/replaydash-production-api --follow

# Filter for errors
aws logs tail /ecs/replaydash-production-api --follow --filter-pattern "ERROR"

# Last 1 hour of logs
aws logs tail /ecs/replaydash-production-api --since 1h
```

### Alerts

Configured CloudWatch alarms:
- ✅ High response time (>1 second)
- ✅ Unhealthy targets
- ✅ High 5xx errors (>10/minute)
- ✅ High CPU (>85%)
- ✅ High memory (>90%)
- ✅ RDS CPU (>80%)
- ✅ RDS low storage (<5GB)
- ✅ RDS high connections (>80)

Alerts are sent to the email specified in `terraform.tfvars`.

**Confirm SNS subscription:**
1. Check your email
2. Click the confirmation link

### Metrics to Monitor

**Key Performance Indicators:**
- Response time (target: <500ms p95)
- Error rate (target: <0.1%)
- Request rate
- Active sessions
- Database connections

**Infrastructure:**
- ECS task count
- CPU/Memory utilization
- Database CPU/connections
- Redis memory usage

## Rollback Procedures

### Rollback to Previous Docker Image

```bash
# List recent images
aws ecr describe-images \
  --repository-name replaydash-production-api \
  --query 'sort_by(imageDetails,& imagePushedAt)[-5:]' \
  --output table

# Get current task definition
aws ecs describe-task-definition \
  --task-definition replaydash-production-api \
  --query 'taskDefinition.taskDefinitionArn'

# Rollback to specific version
# Option 1: Use previous task definition revision
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition replaydash-production-api:123 \
  --force-new-deployment

# Option 2: Update to specific image tag
# Download task definition, edit image tag, then:
aws ecs register-task-definition --cli-input-json file://task-def.json
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition replaydash-production-api:new-revision
```

### Rollback Database Migration

**Restore from snapshot:**

```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier replaydash-production-postgres \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier replaydash-production-postgres-restored \
  --db-snapshot-identifier rds:replaydash-production-postgres-2024-02-24-03-00

# Update DATABASE_URL to point to restored instance
```

### Rollback Infrastructure Changes

```bash
cd infrastructure/terraform

# View state history
terraform state list

# Revert to previous state (use with caution!)
# Restore from backup if you have one
terraform state pull > current-state.json

# To truly rollback, use version control
git checkout <previous-commit>
terraform apply
```

## Troubleshooting

### ECS Tasks Not Starting

**Symptoms:**
- Tasks transition from PENDING to STOPPED
- Zero healthy targets in ALB

**Diagnosis:**

```bash
# Get stopped task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster replaydash-production-cluster \
  --desired-status STOPPED \
  --query 'taskArns[0]' \
  --output text)

# Describe stopped task
aws ecs describe-tasks \
  --cluster replaydash-production-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].{StopCode:stopCode,StoppedReason:stoppedReason,Containers:containers[0].reason}'

# Check logs
aws logs tail /ecs/replaydash-production-api --since 30m
```

**Common causes:**
1. **Database connection failure**
   - Check security groups
   - Verify DATABASE_URL in Secrets Manager
   - Test connection from ECS task

2. **Image pull error**
   - Verify ECR permissions
   - Check if image exists:
     ```bash
     aws ecr describe-images \
       --repository-name replaydash-production-api \
       --image-ids imageTag=latest
     ```

3. **Health check failing**
   - Verify `/health` endpoint works
   - Check health check configuration in target group

4. **Insufficient memory/CPU**
   - Review task logs for OOM errors
   - Increase task CPU/memory in Terraform

### Database Connection Issues

**Diagnosis:**

```bash
# Test database connectivity
# From within VPC (requires bastion or ECS Exec)
psql -h <db-endpoint> -U replaydash_admin -d replaydash

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids <rds-sg-id> \
  --query 'SecurityGroups[0].IpPermissions'
```

**Solutions:**
- Verify security group allows traffic from ECS tasks SG
- Check NACL rules
- Verify database is in same VPC

### High Latency

**Diagnosis:**

```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=<alb-arn-suffix> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Solutions:**
1. Scale up ECS tasks
2. Optimize database queries (use RDS Performance Insights)
3. Add database read replicas
4. Enable Redis caching
5. Check for N+1 queries

### High Costs

**Review costs:**

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# By resource tags
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project
```

**Cost optimization:**
1. **Right-size instances**
   - Use t4g (ARM) instead of t3
   - Review CloudWatch metrics for underutilized resources

2. **Use Fargate Spot** (for non-production)
   ```hcl
   capacity_provider_strategy {
     capacity_provider = "FARGATE_SPOT"
     weight            = 100
   }
   ```

3. **Schedule scale-down**
   - Scale to 0 tasks during off-hours (non-prod)
   - Use EventBridge rules

4. **RDS Reserved Instances**
   - Commit to 1-year for 30% savings

5. **S3 lifecycle policies**
   - Already configured to transition to cheaper storage classes

### SSL Certificate Issues

**Not validated:**

```bash
# Check status
aws acm describe-certificate \
  --certificate-arn <cert-arn> \
  --query 'Certificate.Status'

# Get validation records again
terraform output certificate_validation_records
```

**Solutions:**
- Ensure DNS records are created correctly
- Wait up to 30 minutes for propagation
- Verify domain ownership

## Best Practices

### Security

- ✅ Rotate database passwords regularly
- ✅ Enable MFA on AWS account
- ✅ Use least-privilege IAM policies
- ✅ Enable AWS CloudTrail for audit logs
- ✅ Scan Docker images for vulnerabilities
- ✅ Keep dependencies up to date

### Performance

- ✅ Use connection pooling (Prisma default)
- ✅ Enable Redis caching for frequently accessed data
- ✅ Optimize database indexes
- ✅ Use compression for API responses
- ✅ Implement rate limiting

### Reliability

- ✅ Enable multi-AZ for production RDS
- ✅ Use health checks
- ✅ Set up automated backups
- ✅ Test disaster recovery procedures
- ✅ Document runbooks

### Cost Optimization

- ✅ Use ARM-based instances (t4g)
- ✅ Enable auto-scaling
- ✅ Review unused resources monthly
- ✅ Use Savings Plans for consistent workloads
- ✅ Monitor and alert on cost anomalies

## Support & Resources

### AWS Support
- Console: https://console.aws.amazon.com/support/
- Documentation: https://docs.aws.amazon.com/

### Terraform
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- Best Practices: https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html

### ReplayDash
- GitHub Issues: https://github.com/YOUR_USERNAME/replaydash/issues
- API Docs: https://api.replaydash.com/api/docs

---

**Last Updated:** February 24, 2024

For questions or issues, contact: your-email@example.com
