# Deployment Scripts

This directory contains helper scripts for deploying and managing the ReplayDash API on AWS.

## Available Scripts

### `deploy.sh`

Complete deployment script that handles building, pushing, and deploying the API.

**Usage:**
```bash
./scripts/deploy.sh [environment]
```

**Example:**
```bash
./scripts/deploy.sh production
```

**What it does:**
1. ✅ Validates prerequisites (AWS CLI, Docker)
2. ✅ Gets infrastructure details from Terraform
3. ✅ Builds Docker image
4. ✅ Pushes to ECR with version tag
5. ✅ Runs database migrations
6. ✅ Deploys to ECS
7. ✅ Waits for service stability
8. ✅ Runs health check

**Environment:** `production` (default) or `staging`

---

### `migrate-database.sh`

Runs Prisma database migrations against the production database.

**Usage:**
```bash
./scripts/migrate-database.sh [environment]
```

**Example:**
```bash
./scripts/migrate-database.sh production
```

**What it does:**
1. ✅ Fetches database credentials from AWS Secrets Manager
2. ✅ Generates Prisma Client
3. ✅ Runs `prisma migrate deploy`
4. ✅ Shows migration status

**Environment:** `production` (default) or `staging`

---

### `logs.sh`

View and follow CloudWatch logs for the API.

**Usage:**
```bash
./scripts/logs.sh [environment] [options]
```

**Options:**
- `--follow` or `-f`: Follow log output (like `tail -f`)
- `--filter PATTERN`: Filter logs by pattern
- `--since TIME`: Show logs from specified time (default: 30m)

**Examples:**

```bash
# View recent logs
./scripts/logs.sh production

# Follow logs in real-time
./scripts/logs.sh production --follow

# Filter for errors
./scripts/logs.sh production --follow --filter "ERROR"

# Show logs from last hour
./scripts/logs.sh production --since 1h

# Show logs from last 5 minutes
./scripts/logs.sh production --since 5m --follow
```

---

### `rollback-ecs.sh`

Quick ECS deployment rollback to a previous task definition revision.

**Usage:**
```bash
./scripts/rollback-ecs.sh <revision-number>
```

**Example:**
```bash
# List recent revisions
./scripts/rollback-ecs.sh

# Rollback to revision 123
./scripts/rollback-ecs.sh 123
```

**What it does:**
1. ✅ Updates ECS service to specified task definition revision
2. ✅ Waits for service to stabilize
3. ✅ Runs health check

---

## Prerequisites

All scripts require:
- **AWS CLI** configured with credentials
- **Terraform** state in `infrastructure/terraform/`
- **Appropriate AWS permissions**

Some scripts also require:
- **Docker** (for deploy.sh)
- **Node.js** and **npm** (for migrate-database.sh)
- **jq** (for JSON parsing)

## Environment Variables

Scripts automatically fetch infrastructure details from Terraform outputs. Make sure you've run `terraform apply` first.

## Common Workflows

### Initial Deployment

```bash
# 1. Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform apply

# 2. Deploy application
cd ../..
./scripts/deploy.sh production
```

### Update Application Code

```bash
# After making code changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Or deploy manually
./scripts/deploy.sh production
```

### Database Migration

```bash
# After creating a migration locally
git add packages/api/prisma/migrations
git commit -m "feat: add new table"
git push origin main

# Or run manually
./scripts/migrate-database.sh production
```

### Troubleshooting Deployment

```bash
# View logs
./scripts/logs.sh production --follow

# Filter for errors
./scripts/logs.sh production --filter "ERROR"

# Rollback if needed
./scripts/rollback-ecs.sh  # Shows recent revisions
./scripts/rollback-ecs.sh 123  # Rollback to revision 123
```

### Monitor Application

```bash
# Follow logs
./scripts/logs.sh production --follow

# In another terminal, watch service status
watch -n 5 'aws ecs describe-services \
  --cluster replaydash-production-cluster \
  --services replaydash-production-api \
  --query "services[0].{Running:runningCount,Desired:desiredCount,Pending:pendingCount}" \
  --output table'
```

## Script Customization

All scripts are designed to be customizable. Edit them to:
- Change default regions
- Add additional health checks
- Send notifications (Slack, email)
- Add performance metrics

## Troubleshooting

### "Permission denied" error

Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### "AWS CLI not found"

Install AWS CLI:
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### "Terraform state not found"

Make sure you've run Terraform:
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### "Secret not found"

Verify the secret exists:
```bash
aws secretsmanager list-secrets --query "SecretList[?contains(Name, 'replaydash')]"
```

## Best Practices

1. **Always test in staging first**
   ```bash
   ./scripts/deploy.sh staging
   # Test thoroughly
   ./scripts/deploy.sh production
   ```

2. **Monitor during deployment**
   ```bash
   ./scripts/deploy.sh production &
   ./scripts/logs.sh production --follow
   ```

3. **Keep backups**
   - Database snapshots are automatic
   - Docker images are versioned
   - Keep recent task definitions

4. **Document changes**
   - Commit messages should be clear
   - Update CHANGELOG.md
   - Add migration notes if needed

## Contributing

When adding new scripts:
1. Follow the same structure (error handling, colored output)
2. Make them executable: `chmod +x scripts/new-script.sh`
3. Add documentation in this README
4. Test thoroughly in staging

## Support

For issues with scripts:
- Check script output for error messages
- Review CloudWatch logs: `./scripts/logs.sh production`
- Consult deployment documentation: `docs/DEPLOYMENT.md`

---

**Last Updated:** February 24, 2024
