# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-subnet-group"
  })
}

# ElastiCache Redis Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  name   = "${local.name_prefix}-redis-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-params"
  })
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${local.name_prefix}-redis"
  replication_group_description = "Redis cluster for ReplayDash Bull queue"
  
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  
  # Network
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  # High Availability
  automatic_failover_enabled = var.environment == "production" ? true : false
  multi_az_enabled          = var.environment == "production" ? true : false
  
  # Backup
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00" # UTC
  maintenance_window      = "mon:05:00-mon:07:00" # UTC
  
  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = false # Disabled for simplicity with Bull (can enable if needed)
  
  # Notifications
  notification_topic_arn = var.alert_email != "" ? aws_sns_topic.alerts[0].arn : null

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })
}

# Store Redis endpoint in SSM Parameter Store
resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "/${var.project_name}/${var.environment}/redis/endpoint"
  type  = "String"
  value = aws_elasticache_replication_group.redis.primary_endpoint_address

  tags = local.common_tags
}

resource "aws_ssm_parameter" "redis_port" {
  name  = "/${var.project_name}/${var.environment}/redis/port"
  type  = "String"
  value = tostring(aws_elasticache_replication_group.redis.port)

  tags = local.common_tags
}
