# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production" ? true : false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb"
  })
}

# Target Group for API
resource "aws_lb_target_group" "api" {
  name        = "${local.name_prefix}-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-api-tg"
  })
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-http-listener"
  })
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn != "" ? var.certificate_arn : aws_acm_certificate.main[0].arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-https-listener"
  })

  depends_on = [
    aws_acm_certificate_validation.main
  ]
}

# ACM Certificate (if not provided)
resource "aws_acm_certificate" "main" {
  count             = var.certificate_arn == "" ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-certificate"
  })
}

# Certificate Validation (requires manual DNS record creation)
resource "aws_acm_certificate_validation" "main" {
  count           = var.certificate_arn == "" ? 1 : 0
  certificate_arn = aws_acm_certificate.main[0].arn

  timeouts {
    create = "45m"
  }
}
