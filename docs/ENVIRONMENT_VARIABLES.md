# Environment Variables Reference

This document describes all environment variables used in the ReplayDash API.

## Table of Contents

1. [Application Variables](#application-variables)
2. [Database Variables](#database-variables)
3. [Redis Variables](#redis-variables)
4. [AWS Variables](#aws-variables)
5. [Security Variables](#security-variables)
6. [Development Variables](#development-variables)

## Application Variables

### `NODE_ENV`
- **Description:** Application environment
- **Required:** Yes
- **Values:** `development`, `production`, `test`
- **Default:** `development`
- **Example:** `production`

### `PORT`
- **Description:** Port the API server listens on
- **Required:** No
- **Default:** `3001`
- **Example:** `3001`

### `CORS_ORIGIN`
- **Description:** Allowed CORS origin (dashboard URL)
- **Required:** Yes (in production)
- **Default:** `http://localhost:3000`
- **Example:** `https://replaydash.com`

## Database Variables

### `DATABASE_URL`
- **Description:** PostgreSQL connection string
- **Required:** Yes
- **Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`
- **Example:** `postgresql://replaydash_admin:password@replaydash-production-postgres.xyz.us-east-1.rds.amazonaws.com:5432/replaydash?schema=public`
- **Storage:** AWS Secrets Manager (production)
- **Secret Name:** `replaydash-{environment}/db/password`

**Connection Parameters:**
- `connection_limit`: Maximum number of connections in the pool (default: 10)
- `pool_timeout`: Maximum time to wait for a connection (default: 10s)
- `connect_timeout`: Database connection timeout (default: 5s)

**Example with parameters:**
```
postgresql://user:pass@host:5432/db?schema=public&connection_limit=10&pool_timeout=10
```

## Redis Variables

### `REDIS_HOST`
- **Description:** Redis server hostname
- **Required:** Yes
- **Default:** `localhost`
- **Example:** `replaydash-production-redis.abc123.ng.0001.use1.cache.amazonaws.com`

### `REDIS_PORT`
- **Description:** Redis server port
- **Required:** No
- **Default:** `6379`
- **Example:** `6379`

### `REDIS_PASSWORD`
- **Description:** Redis password (if auth enabled)
- **Required:** No (ElastiCache without transit encryption doesn't require password)
- **Default:** None
- **Example:** `your-redis-password`

### `REDIS_DB`
- **Description:** Redis database number
- **Required:** No
- **Default:** `0`
- **Example:** `0`

## AWS Variables

### `AWS_REGION`
- **Description:** AWS region for services (S3, etc.)
- **Required:** Yes (in production)
- **Default:** Inherited from EC2 instance metadata
- **Example:** `us-east-1`

### `AWS_ACCESS_KEY_ID`
- **Description:** AWS access key ID
- **Required:** No (uses IAM role in ECS)
- **Example:** `AKIAIOSFODNN7EXAMPLE`

### `AWS_SECRET_ACCESS_KEY`
- **Description:** AWS secret access key
- **Required:** No (uses IAM role in ECS)
- **Example:** `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### `S3_SESSIONS_BUCKET`
- **Description:** S3 bucket name for session storage
- **Required:** No (optional feature)
- **Default:** None
- **Example:** `replaydash-production-sessions`

## Security Variables

### `API_KEY`
- **Description:** API key for authentication (simple auth)
- **Required:** No (if using database-backed API keys)
- **Default:** None
- **Example:** `sk_live_a1b2c3d4e5f6g7h8i9j0`
- **Storage:** AWS Secrets Manager (recommended)

### `JWT_SECRET`
- **Description:** Secret key for JWT token signing
- **Required:** No (future use for dashboard auth)
- **Default:** None
- **Example:** `your-super-secret-jwt-key-min-32-chars`
- **Storage:** AWS Secrets Manager

## Development Variables

### `LOG_LEVEL`
- **Description:** Logging verbosity
- **Required:** No
- **Values:** `error`, `warn`, `info`, `debug`, `verbose`
- **Default:** `info`
- **Example:** `debug`

### `ENABLE_SWAGGER`
- **Description:** Enable Swagger API documentation
- **Required:** No
- **Default:** `true`
- **Example:** `false` (disable in production for security)

### `PRISMA_LOG_LEVEL`
- **Description:** Prisma ORM logging level
- **Required:** No
- **Values:** `query`, `info`, `warn`, `error`
- **Default:** `info`
- **Example:** `query,info,warn,error`

## Setting Environment Variables

### Local Development

Create a `.env` file in `packages/api/`:

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/replaydash?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000
API_KEY=dev-api-key-12345
LOG_LEVEL=debug
```

### Production (ECS)

Environment variables are set in the ECS task definition via Terraform:

**File:** `infrastructure/terraform/ecs.tf`

```hcl
environment = [
  {
    name  = "NODE_ENV"
    value = "production"
  },
  {
    name  = "PORT"
    value = "3001"
  },
  # ...
]

secrets = [
  {
    name      = "DATABASE_URL"
    valueFrom = "${aws_secretsmanager_secret.db_password.arn}:url::"
  }
]
```

### Adding New Variables

#### 1. Add to Task Definition (Terraform)

```hcl
# Non-sensitive variables
environment = [
  # ... existing variables
  {
    name  = "NEW_VARIABLE"
    value = "new_value"
  }
]

# Sensitive variables (use Secrets Manager)
secrets = [
  # ... existing secrets
  {
    name      = "NEW_SECRET"
    valueFrom = "arn:aws:secretsmanager:region:account:secret:name"
  }
]
```

#### 2. Apply Terraform Changes

```bash
cd infrastructure/terraform
terraform apply
```

#### 3. Redeploy ECS Service

```bash
./scripts/deploy.sh production
```

### GitHub Actions (CI/CD)

Secrets are stored as GitHub repository secrets:

**Settings → Secrets and variables → Actions**

Required secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Optional secrets:
- `SENTRY_DSN` (error tracking)
- `SLACK_WEBHOOK` (deployment notifications)

## Variable Validation

The API validates required environment variables on startup. If any required variable is missing, the application will fail to start with a clear error message.

**Validation checks:**
- ✅ `DATABASE_URL` is a valid PostgreSQL connection string
- ✅ `REDIS_HOST` is reachable
- ✅ `CORS_ORIGIN` is a valid URL
- ✅ `PORT` is a valid number

## Security Best Practices

### DO ✅
- Use AWS Secrets Manager for sensitive data in production
- Use IAM roles instead of hardcoded credentials
- Rotate secrets regularly (use AWS auto-rotation)
- Use strong, randomly generated secrets
- Never commit `.env` files to version control

### DON'T ❌
- Store secrets in plaintext
- Use the same secrets across environments
- Share production credentials
- Log sensitive variables
- Expose secrets in error messages

## Troubleshooting

### "Database connection failed"

**Check:**
1. `DATABASE_URL` is correctly formatted
2. Database is accessible from ECS tasks (security groups)
3. Database credentials are correct
4. Database instance is running

**Debug:**
```bash
# Get DATABASE_URL from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id replaydash-production/db/password \
  --query SecretString \
  --output text | jq -r .url

# Test connection (from within VPC)
psql "$DATABASE_URL" -c "SELECT version();"
```

### "Redis connection failed"

**Check:**
1. `REDIS_HOST` and `REDIS_PORT` are correct
2. ElastiCache cluster is available
3. Security groups allow traffic from ECS tasks
4. Redis endpoint is correct (primary vs reader)

**Debug:**
```bash
# Get Redis endpoint
aws elasticache describe-replication-groups \
  --replication-group-id replaydash-production-redis \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.{Address:Address,Port:Port}'

# Test connection (from within VPC)
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

### "CORS error in browser"

**Check:**
1. `CORS_ORIGIN` matches your dashboard domain exactly (including protocol)
2. No trailing slash in `CORS_ORIGIN`
3. HTTPS vs HTTP

**Correct examples:**
- ✅ `https://replaydash.com`
- ✅ `http://localhost:3000`
- ❌ `https://replaydash.com/` (trailing slash)
- ❌ `replaydash.com` (missing protocol)

## Resources

- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [ECS Task Definition Parameters](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

**Last Updated:** February 24, 2024
