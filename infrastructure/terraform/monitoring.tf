# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  count = var.alert_email != "" ? 1 : 0
  name  = "${local.name_prefix}-alerts"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alerts"
  })
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudWatch Alarms for ALB
resource "aws_cloudwatch_metric_alarm" "alb_target_response_time" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-alb-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1.0" # 1 second
  alarm_description   = "Alert when ALB target response time is high"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_targets" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-alb-unhealthy-targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "Alert when there are unhealthy targets"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
    TargetGroup  = aws_lb_target_group.api.arn_suffix
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-alb-high-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alert when there are high 5xx errors"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

# CloudWatch Alarms for ECS
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-ecs-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "Alert when ECS CPU utilization is high"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-ecs-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "90"
  alarm_description   = "Alert when ECS memory utilization is high"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }

  tags = local.common_tags
}

# CloudWatch Alarms for RDS
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alert when RDS CPU utilization is high"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000000000" # 5 GB
  alarm_description   = "Alert when RDS free storage is low"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "60"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alert when RDS connections are high"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = local.common_tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.name_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average", label = "Response Time" }],
            [".", "RequestCount", { stat = "Sum", label = "Request Count" }],
            [".", "HTTPCode_Target_5XX_Count", { stat = "Sum", label = "5xx Errors" }]
          ]
          period = 60
          stat   = "Average"
          region = var.aws_region
          title  = "ALB Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average", label = "CPU" }],
            [".", "MemoryUtilization", { stat = "Average", label = "Memory" }]
          ]
          period = 60
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average", label = "CPU" }],
            [".", "DatabaseConnections", { stat = "Average", label = "Connections" }],
            [".", "FreeStorageSpace", { stat = "Average", label = "Free Storage" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Metrics"
        }
      }
    ]
  })
}

# Cost Allocation Tags
resource "aws_ce_cost_category" "environment" {
  count = var.environment == "production" ? 1 : 0
  name  = "Environment"
  
  rule_version = "CostCategoryExpression.v1"
  
  rule {
    value = var.environment
    rule {
      dimension {
        key           = "Environment"
        values        = [var.environment]
        match_options = ["EQUALS"]
      }
    }
  }
}
