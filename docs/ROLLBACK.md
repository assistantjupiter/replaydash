# Rollback Procedures

This guide covers emergency rollback procedures for the ReplayDash API.

## Quick Reference

| Issue | Rollback Method | Time to Rollback |
|-------|----------------|------------------|
| Bad deployment | [ECS image rollback](#ecs-deployment-rollback) | ~2-3 minutes |
| Database migration issue | [Database restore](#database-rollback) | ~10-15 minutes |
| Infrastructure change | [Terraform rollback](#infrastructure-rollback) | ~15-20 minutes |
| Configuration error | [Environment variable update](#environment-variable-rollback) | ~2-3 minutes |

## ECS Deployment Rollback

### Method 1: Rollback to Previous Task Definition (Fastest)

```bash
# List recent task definitions
aws ecs list-task-definitions \
  --family-prefix replaydash-production-api \
  --sort DESC \
  --max-items 10

# Get current task definition revision
CURRENT=$(aws ecs describe-services \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current: $CURRENT"

# Rollback to previous revision (e.g., revision 123)
PREVIOUS_REVISION=123

aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition replaydash-production-api:$PREVIOUS_REVISION \
  --force-new-deployment

# Wait for service to stabilize
aws ecs wait services-stable \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api

# Verify
curl https://api.replaydash.com/health
```

### Method 2: Rollback to Specific Docker Image

```bash
# List recent images
aws ecr describe-images \
  --repository-name replaydash-production-api \
  --query 'sort_by(imageDetails, &imagePushedAt)[-10:].[imageTags[0], imagePushedAt]' \
  --output table

# Identify the image tag to rollback to (e.g., v20240224-120000)
ROLLBACK_TAG="v20240224-120000"
ECR_URL=$(cd infrastructure/terraform && terraform output -raw ecr_repository_url)

# Download current task definition
aws ecs describe-task-definition \
  --task-definition replaydash-production-api \
  --query 'taskDefinition' > task-def.json

# Update image in task-def.json
sed -i '' "s|\"image\": \".*\"|\"image\": \"$ECR_URL:$ROLLBACK_TAG\"|g" task-def.json

# Remove fields that can't be used in register-task-definition
jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)' \
  task-def.json > task-def-clean.json

# Register new task definition
NEW_TASK_DEF=$(aws ecs register-task-definition \
  --cli-input-json file://task-def-clean.json \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# Update service
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition $NEW_TASK_DEF \
  --force-new-deployment

# Wait and verify
aws ecs wait services-stable \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api

curl https://api.replaydash.com/health

# Cleanup
rm task-def.json task-def-clean.json
```

### Automated Rollback Script

```bash
#!/bin/bash
# Save as scripts/rollback-ecs.sh

REVISION=${1}

if [ -z "$REVISION" ]; then
    echo "Usage: ./scripts/rollback-ecs.sh <revision-number>"
    echo ""
    echo "Recent revisions:"
    aws ecs list-task-definitions \
      --family-prefix replaydash-production-api \
      --sort DESC \
      --max-items 5 \
      --query 'taskDefinitionArns[]' \
      --output table
    exit 1
fi

echo "Rolling back to revision $REVISION..."

aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --task-definition replaydash-production-api:$REVISION \
  --force-new-deployment

echo "Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api

echo "✅ Rollback complete!"
curl https://api.replaydash.com/health
```

## Database Rollback

### Option 1: Restore from Automated Backup

```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier replaydash-production-postgres \
  --query 'sort_by(DBSnapshots, &SnapshotCreateTime)[-10:].[DBSnapshotIdentifier, SnapshotCreateTime, Status]' \
  --output table

# Choose a snapshot (e.g., rds:replaydash-production-postgres-2024-02-24-03-00)
SNAPSHOT_ID="rds:replaydash-production-postgres-2024-02-24-03-00"

# Restore to a new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier replaydash-production-postgres-restored \
  --db-snapshot-identifier $SNAPSHOT_ID \
  --db-instance-class db.t4g.medium \
  --vpc-security-group-ids $(aws rds describe-db-instances \
    --db-instance-identifier replaydash-production-postgres \
    --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
    --output text) \
  --db-subnet-group-name $(aws rds describe-db-instances \
    --db-instance-identifier replaydash-production-postgres \
    --query 'DBInstances[0].DBSubnetGroup.DBSubnetGroupName' \
    --output text) \
  --publicly-accessible false \
  --no-multi-az  # Remove this for production

# Wait for instance to be available (10-15 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier replaydash-production-postgres-restored

# Get new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier replaydash-production-postgres-restored \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "New database endpoint: $NEW_ENDPOINT"

# Update Secrets Manager with new endpoint
# (or switch DNS to point to new instance)

# Update DATABASE_URL in Secrets Manager
aws secretsmanager update-secret \
  --secret-id replaydash-production/db/password \
  --secret-string "$(aws secretsmanager get-secret-value \
    --secret-id replaydash-production/db/password \
    --query SecretString \
    --output text | \
    jq --arg endpoint "$NEW_ENDPOINT" '.host = $endpoint | .url = "postgresql://\(.username):\(.password)@\($endpoint):5432/\(.dbname)?schema=public"')"

# Restart ECS tasks to pick up new DATABASE_URL
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --force-new-deployment

# Wait and verify
aws ecs wait services-stable \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api

curl https://api.replaydash.com/health
```

### Option 2: Manual Database Restore

If you have a manual backup:

```bash
# Export DATABASE_URL
export DATABASE_URL="postgresql://user:pass@restored-host:5432/replaydash"

# Restore from SQL dump
psql "$DATABASE_URL" < backup.sql

# Or use pg_restore for custom format
pg_restore -d "$DATABASE_URL" backup.dump
```

### Option 3: Undo Specific Migration

Prisma doesn't support automated rollbacks, but you can create a reverse migration:

```bash
# Create a new migration that undoes the changes
cd packages/api

# Example: If you added a column, create migration to drop it
npx prisma migrate dev --name undo_column_addition

# Edit the generated migration file to include the reverse changes

# Deploy the reverse migration
npx prisma migrate deploy
```

## Infrastructure Rollback

### Terraform Rollback

```bash
cd infrastructure/terraform

# View current state
terraform show

# Option 1: Rollback to previous Git commit
git log --oneline -10  # Find the commit to rollback to
git checkout <commit-hash>
terraform apply

# Option 2: Restore from state backup
terraform state pull > current-state.tfstate.backup
# If you have a previous state backup:
terraform state push previous-state.tfstate

# Option 3: Import specific resources
# If a resource was deleted, reimport it
terraform import aws_ecs_service.api arn:aws:ecs:us-east-1:123456789:service/...

# Verify changes
terraform plan
terraform apply
```

### Critical Resource Recovery

**If ECS cluster was deleted:**

```bash
# Recreate using Terraform
cd infrastructure/terraform
terraform apply -target=aws_ecs_cluster.main
terraform apply -target=aws_ecs_service.api
```

**If RDS instance was deleted:**

```bash
# Restore from snapshot (see Database Rollback above)
# Then update Terraform state
terraform import aws_db_instance.postgresql replaydash-production-postgres-restored
```

## Environment Variable Rollback

### Revert to Previous Environment Variables

```bash
# Get previous task definition
PREVIOUS_TASK_DEF_ARN=$(aws ecs list-task-definitions \
  --family-prefix replaydash-production-api \
  --sort DESC \
  --max-items 2 \
  --query 'taskDefinitionArns[1]' \
  --output text)

# Extract environment variables
aws ecs describe-task-definition \
  --task-definition $PREVIOUS_TASK_DEF_ARN \
  --query 'taskDefinition.containerDefinitions[0].environment' > previous-env.json

# Apply to current task definition
# (Create new revision with previous environment variables)
```

### Update Single Environment Variable

```bash
# Download current task definition
aws ecs describe-task-definition \
  --task-definition replaydash-production-api \
  --query 'taskDefinition' > task-def.json

# Edit environment variable in task-def.json
# (Use jq or manually edit)

# Register new task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Update service
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --force-new-deployment
```

## Emergency Procedures

### Complete Service Shutdown

If you need to immediately stop all API traffic:

```bash
# Scale service to 0
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --desired-count 0

# Or disable ALB target group
aws elbv2 modify-target-group \
  --target-group-arn <target-group-arn> \
  --health-check-enabled false
```

### Quick Service Restart

```bash
# Restart all tasks
aws ecs update-service \
  --cluster replaydash-production-cluster \
  --service replaydash-production-api \
  --force-new-deployment
```

### Enable Maintenance Mode

If you need to show a maintenance page:

```bash
# Update ALB listener to return fixed response
aws elbv2 modify-listener \
  --listener-arn <listener-arn> \
  --default-actions Type=fixed-response,FixedResponseConfig='{MessageBody="Service under maintenance. We'll be back soon!",StatusCode="503",ContentType="text/plain"}'

# To restore normal operation:
aws elbv2 modify-listener \
  --listener-arn <listener-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

## Post-Rollback Checklist

After completing a rollback:

- [ ] Verify API is responding: `curl https://api.replaydash.com/health`
- [ ] Check CloudWatch logs for errors
- [ ] Monitor CloudWatch dashboard for anomalies
- [ ] Test critical API endpoints
- [ ] Verify database connectivity
- [ ] Check ECS task count matches desired count
- [ ] Review ALB target health
- [ ] Document the incident and rollback in postmortem
- [ ] Update team on status

## Prevention Best Practices

To minimize the need for rollbacks:

1. **Test thoroughly before deployment**
   - Use staging environment
   - Run integration tests
   - Load test critical paths

2. **Deploy during low-traffic periods**
   - Schedule deployments during off-peak hours
   - Communicate maintenance windows

3. **Use gradual rollouts**
   - Deploy to staging first
   - Canary deployments (future enhancement)
   - Blue/green deployments (future enhancement)

4. **Monitor actively during deployment**
   - Watch CloudWatch dashboard
   - Monitor error rates
   - Check logs in real-time

5. **Maintain database backups**
   - Automated daily snapshots
   - Test restore procedures regularly
   - Keep backups for 7+ days

6. **Version everything**
   - Tag Docker images with version numbers
   - Track Terraform state changes
   - Maintain migration history

## Rollback Decision Tree

```
Is the issue critical (production down)?
│
├─ YES → Execute immediate rollback
│         ├─ ECS deployment issue → Use Method 1 (fastest)
│         ├─ Database issue → Scale to 0, restore from snapshot
│         └─ Infrastructure issue → Terraform rollback
│
└─ NO  → Investigate and plan fix
          ├─ Can it be fixed forward? → Deploy fix
          └─ Requires rollback? → Follow standard procedure
```

## Support

For emergency support during rollback:
- Check runbooks in this documentation
- Review CloudWatch logs
- Contact: [your-on-call-email@example.com]

---

**Last Updated:** February 24, 2024
