variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "replaydash"
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium" # ARM-based, cost-effective
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS autoscaling in GB"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "replaydash"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "replaydash_admin"
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.micro" # ARM-based, cost-effective
}

# ECS Configuration
variable "api_cpu" {
  description = "CPU units for API container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Memory for API container in MB"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 2
}

variable "api_min_capacity" {
  description = "Minimum number of API tasks for autoscaling"
  type        = number
  default     = 1
}

variable "api_max_capacity" {
  description = "Maximum number of API tasks for autoscaling"
  type        = number
  default     = 4
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the API (e.g., api.replaydash.com)"
  type        = string
  default     = "api.replaydash.com"
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS (optional, will create if not provided)"
  type        = string
  default     = ""
}

# CORS Configuration
variable "cors_origin" {
  description = "CORS allowed origin"
  type        = string
  default     = "https://replaydash.com"
}

# Monitoring
variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = ""
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "ReplayDash"
    ManagedBy   = "Terraform"
  }
}
