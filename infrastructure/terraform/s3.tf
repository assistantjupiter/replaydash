# S3 Bucket for Session Data Storage
resource "aws_s3_bucket" "sessions" {
  bucket = "${local.name_prefix}-sessions"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-sessions"
  })
}

# Enable versioning
resource "aws_s3_bucket_versioning" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy to reduce costs
resource "aws_s3_bucket_lifecycle_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    expiration {
      days = 365 # Keep session data for 1 year
    }
  }

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS configuration for direct uploads if needed
resource "aws_s3_bucket_cors_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = [var.cors_origin]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Store S3 bucket name in SSM Parameter Store
resource "aws_ssm_parameter" "s3_bucket_name" {
  name  = "/${var.project_name}/${var.environment}/s3/sessions-bucket"
  type  = "String"
  value = aws_s3_bucket.sessions.id

  tags = local.common_tags
}
