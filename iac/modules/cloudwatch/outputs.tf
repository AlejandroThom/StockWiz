output "dashboard_name" {
  value = aws_cloudwatch_dashboard.main.dashboard_name
}

output "high_cpu_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.high_cpu.arn
}

output "high_5xx_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.high_5xx_errors.arn
}
