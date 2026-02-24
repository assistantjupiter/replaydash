# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-subnet-group"
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgresql" {
  identifier     = "${local.name_prefix}-postgres"
  engine         = "postgres"
  engine_version = "16.3" # Latest stable version

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3" # Cost-effective, better performance than gp2
  storage_encrypted = true
  
  # Storage autoscaling
  max_allocated_storage = var.db_max_allocated_storage

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup
  backup_retention_period = 7
  backup_window          = "03:00-04:00" # UTC
  maintenance_window     = "mon:04:00-mon:05:00" # UTC
  skip_final_snapshot    = false
  final_snapshot_identifier = "${local.name_prefix}-postgres-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled   = true
  performance_insights_retention_period = 7

  # High Availability (disable for cost savings in non-prod)
  multi_az = var.environment == "production" ? true : false

  # Deletion protection
  deletion_protection = var.environment == "production" ? true : false

  # Parameters
  parameter_group_name = aws_db_parameter_group.postgresql.name

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-postgres"
  })

  lifecycle {
    ignore_changes = [
      final_snapshot_identifier
    ]
  }
}

# RDS Parameter Group for PostgreSQL optimization
resource "aws_db_parameter_group" "postgresql" {
  name   = "${local.name_prefix}-postgres-params"
  family = "postgres16"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-postgres-params"
  })
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${local.name_prefix}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Store database password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "${local.name_prefix}/db/password"
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-password"
  })
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.postgresql.address
    port     = aws_db_instance.postgresql.port
    dbname   = var.db_name
    url      = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.postgresql.address}:${aws_db_instance.postgresql.port}/${var.db_name}?schema=public"
  })
}
