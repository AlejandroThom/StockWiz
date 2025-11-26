output "service_name" {
  value = aws_ecs_service.service.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.service.arn
}

output "target_group_arn" {
  value = aws_lb_target_group.service.arn
}