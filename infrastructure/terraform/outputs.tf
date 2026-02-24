# Network Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

# Database Outputs
output "database_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "database_secret_arn" {
  description = "ARN of the database password secret in Secrets Manager"
  value       = aws_secretsmanager_secret.db_password.arn
}

# Redis Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.redis.port
}

# S3 Outputs
output "s3_sessions_bucket" {
  description = "S3 bucket name for session storage"
  value       = aws_s3_bucket.sessions.id
}

output "s3_sessions_bucket_arn" {
  description = "S3 bucket ARN for session storage"
  value       = aws_s3_bucket.sessions.arn
}

# ECR Outputs
output "ecr_repository_url" {
  description = "ECR repository URL for API"
  value       = aws_ecr_repository.api.repository_url
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.api.name
}

# ALB Outputs
output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB hosted zone ID (for Route53 alias records)"
  value       = aws_lb.main.zone_id
}

output "api_endpoint" {
  description = "API endpoint URL"
  value       = "https://${var.domain_name}"
}

# Certificate Outputs
output "certificate_validation_records" {
  description = "DNS records needed for certificate validation (if certificate was created)"
  value = var.certificate_arn == "" ? [
    for dvo in aws_acm_certificate.main[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}

# Monitoring Outputs
output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = var.alert_email != "" ? aws_sns_topic.alerts[0].arn : null
}

# Deployment Information
output "deployment_summary" {
  description = "Deployment summary and next steps"
  value = <<-EOT
    ============================================
    ReplayDash API Deployment Summary
    ============================================
    
    API Endpoint: https://${var.domain_name}
    ALB DNS: ${aws_lb.main.dns_name}
    
    Next Steps:
    1. Create DNS record:
       - Type: A (Alias)
       - Name: ${var.domain_name}
       - Value: ${aws_lb.main.dns_name}
       - Zone ID: ${aws_lb.main.zone_id}
    
    2. ${var.certificate_arn == "" ? "Validate ACM Certificate (check email or create DNS records)" : "Certificate already configured"}
    
    3. Build and push Docker image:
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.api.repository_url}
       docker build -t ${aws_ecr_repository.api.repository_url}:latest -f packages/api/Dockerfile .
       docker push ${aws_ecr_repository.api.repository_url}:latest
    
    4. Run database migrations:
       - Connect to ECS task or use migration job
       - Run: npx prisma migrate deploy
    
    5. Update ECS service to deploy:
       aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service ${aws_ecs_service.api.name} --force-new-deployment --region ${var.aws_region}
    
    Database:
    - Endpoint: ${aws_db_instance.postgresql.endpoint}
    - Password: Stored in Secrets Manager (${aws_secretsmanager_secret.db_password.arn})
    
    Redis:
    - Endpoint: ${aws_elasticache_replication_group.redis.primary_endpoint_address}:${aws_elasticache_replication_group.redis.port}
    
    S3:
    - Bucket: ${aws_s3_bucket.sessions.id}
    
    Monitoring:
    - Dashboard: ${aws_cloudwatch_dashboard.main.dashboard_name}
    - Logs: /ecs/${local.name_prefix}-api
    
    ============================================
  EOT
}
