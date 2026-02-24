# ReplayDash Infrastructure - Terraform

This directory contains Terraform Infrastructure as Code (IaC) for deploying ReplayDash API to AWS.

## Architecture Overview

- **Compute:** ECS Fargate (serverless containers)
- **Database:** RDS PostgreSQL (t4g.medium)
- **Cache:** ElastiCache Redis (t4g.micro)
- **Storage:** S3 (session data)
- **Load Balancer:** Application Load Balancer (HTTPS)
- **Networking:** VPC with public/private subnets across 2 AZs
- **Monitoring:** CloudWatch, SNS alerts
- **Secrets:** AWS Secrets Manager, SSM Parameter Store

## Cost Optimization Features

- ARM-based instances (t4g) for better price/performance
- Single NAT Gateway (vs one per AZ)
- VPC endpoints for AWS services (reduce NAT charges)
- S3 lifecycle policies (transition to cheaper storage classes)
- Auto-scaling (pay only for what you use)
- gp3 storage (cheaper than gp2)

**Estimated Monthly Cost:** ~$100-150 USD (production environment with 2 ECS tasks)

## Prerequisites

1. **AWS Account** with administrative access
2. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```
3. **Terraform** installed (v1.0+):
   ```bash
   brew install terraform  # macOS
   ```
4. **Domain name** registered (e.g., replaydash.com)

## Initial Setup

### 1. Configure Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Review the Plan

```bash
terraform plan
```

This will show you all resources that will be created.

### 4. Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will take ~15-20 minutes.

## Post-Deployment Steps

### 1. Configure DNS

After deployment, Terraform will output the ALB DNS name. Create a DNS record:

```
Type: A (Alias)
Name: api.replaydash.com
Value: <ALB_DNS_NAME> (from terraform output)
```

If using Route53:
```bash
# Get the ALB DNS and Zone ID from terraform output
terraform output alb_dns_name
terraform output alb_zone_id

# Then create Route53 alias record (or use console)
```

### 2. Validate SSL Certificate

If Terraform created a new ACM certificate, you need to validate it:

```bash
# Get validation records
terraform output certificate_validation_records

# Create the DNS records shown (CNAME records)
# Wait for validation (can take up to 30 minutes)
```

### 3. Build and Push Docker Image

```bash
# From project root
cd /Users/jupiter/Projects/replaydash

# Get ECR login credentials
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $(terraform -chdir=infrastructure/terraform output -raw ecr_repository_url | cut -d'/' -f1)

# Build Docker image
docker build -t replaydash-api:latest -f packages/api/Dockerfile .

# Tag for ECR
ECR_URL=$(cd infrastructure/terraform && terraform output -raw ecr_repository_url)
docker tag replaydash-api:latest $ECR_URL:latest
docker tag replaydash-api:latest $ECR_URL:v1.0.0

# Push to ECR
docker push $ECR_URL:latest
docker push $ECR_URL:v1.0.0
```

### 4. Run Database Migrations

Option A: Create a one-time ECS task:

```bash
# Get database URL from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id $(cd infrastructure/terraform && terraform output -raw database_secret_arn) \
  --query SecretString \
  --output text | jq -r .url

# Run migration locally (requires VPN/bastion to private subnet)
# Or create ECS task definition for migrations
```

Option B: SSH into ECS task (requires ECS Exec enabled):

```bash
# Enable ECS Exec (add to ECS service in Terraform if needed)

# Connect to running task
TASK_ARN=$(aws ecs list-tasks \
  --cluster replaydash-production-cluster \
  --service-name replaydash-production-api \
  --query 'taskArns[0]' \
  --output text)

aws ecs execute-command \
  --cluster replaydash-production-cluster \
  --task $TASK_ARN \
  --container api \
  --interactive \
  --command "/bin/sh"

# Inside the container
npx prisma migrate deploy
```

### 5. Deploy Application

```bash
# Force new deployment (pulls latest ECR image)
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --force-new-deployment \
  --region us-east-1
```

### 6. Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api \
  --region us-east-1

# Test the API
curl https://api.replaydash.com/health

# View logs
aws logs tail /ecs/replaydash-production-api --follow
```

## Monitoring

### CloudWatch Dashboard

```bash
# Get dashboard URL
terraform output cloudwatch_dashboard_url
```

### View Logs

```bash
# API logs
aws logs tail /ecs/replaydash-production-api --follow

# Filter for errors
aws logs tail /ecs/replaydash-production-api --follow --filter-pattern "ERROR"
```

### Set Up Alerts

If you provided an `alert_email` in terraform.tfvars, confirm the SNS subscription:
1. Check your email
2. Click the confirmation link

## Scaling

### Manual Scaling

```bash
# Scale up to 4 tasks
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --desired-count 4 \
  --region us-east-1

# Scale down to 1 task
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --desired-count 1 \
  --region us-east-1
```

### Auto-Scaling

Auto-scaling is configured to:
- Scale out when CPU > 70% or Memory > 80%
- Scale in when usage drops
- Min: 1 task, Max: 4 tasks (configurable in terraform.tfvars)

## Rollback Procedures

### Rollback to Previous Image

```bash
# List images in ECR
aws ecr describe-images \
  --repository-name replaydash-production-api \
  --region us-east-1

# Update task definition to use specific version
# Then update service
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition replaydash-production-api:123 \
  --region us-east-1
```

### Rollback Infrastructure Changes

```bash
# Terraform keeps state history
terraform state list
terraform state show <resource>

# To revert to previous Terraform state
# (use with caution!)
terraform state pull > backup.tfstate
# Restore from backup if needed
```

## Cost Monitoring

### View Current Costs

```bash
# AWS Cost Explorer
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project
```

### Cost Optimization Tips

1. **Use Spot Instances for non-prod:** Change ECS capacity provider to use Fargate Spot
2. **Schedule scale-down:** Use EventBridge to scale down ECS during off-hours
3. **Review unused resources:** Check for idle load balancers, NAT gateways
4. **Enable S3 Intelligent-Tiering:** Already configured with lifecycle policies
5. **Use RDS Reserved Instances:** For production, commit to 1-year reservation

## Troubleshooting

### ECS Tasks Not Starting

```bash
# Check task logs
aws logs tail /ecs/replaydash-production-api --follow

# Describe tasks to see stopped reason
aws ecs describe-tasks \
  --cluster replaydash-production-cluster \
  --tasks <task-arn> \
  --region us-east-1
```

Common issues:
- **Database connection failure:** Check security groups
- **Image pull error:** Verify ECR permissions
- **Health check failing:** Ensure /health endpoint works

### Database Connection Issues

```bash
# Test from within VPC (requires bastion or ECS exec)
# Check security group rules
aws ec2 describe-security-groups \
  --group-ids <rds-security-group-id> \
  --region us-east-1
```

### Redis Connection Issues

```bash
# Verify ElastiCache status
aws elasticache describe-replication-groups \
  --replication-group-id replaydash-production-redis \
  --region us-east-1
```

## Terraform State Management

### Enable Remote State (Recommended)

Create S3 bucket and DynamoDB table for state locking:

```bash
# Create state bucket
aws s3 mb s3://replaydash-terraform-state --region us-east-1

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name replaydash-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Then uncomment the backend configuration in `main.tf` and run:

```bash
terraform init -migrate-state
```

## Security Best Practices

- ✅ All data encrypted at rest (RDS, S3, ElastiCache)
- ✅ HTTPS only (HTTP redirects to HTTPS)
- ✅ Private subnets for databases and containers
- ✅ Security groups restrict access by service
- ✅ Secrets stored in AWS Secrets Manager
- ✅ IAM roles follow least-privilege principle
- ✅ VPC endpoints reduce internet exposure

## Maintenance

### Update Dependencies

```bash
# Update Terraform providers
terraform init -upgrade

# Review changes
terraform plan
```

### Backup Strategy

- **Database:** Automated daily backups (7-day retention)
- **S3:** Versioning enabled
- **Terraform State:** Store in S3 with versioning

### Disaster Recovery

1. **Database Restore:**
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier replaydash-production-postgres-restored \
     --db-snapshot-identifier <snapshot-id>
   ```

2. **Infrastructure Recovery:**
   ```bash
   # Re-run Terraform (state is in S3)
   terraform apply
   ```

## Cleanup

To destroy all resources (WARNING: This is irreversible!):

```bash
# Disable deletion protection first
terraform apply -var="environment=staging"

# Then destroy
terraform destroy
```

## Support

For issues or questions:
- Check CloudWatch logs: `/ecs/replaydash-production-api`
- Review Terraform state: `terraform show`
- AWS Support: https://console.aws.amazon.com/support/

## Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [RDS Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html)
- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
