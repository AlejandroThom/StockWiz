output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "ecs_instances_sg_id" {
  value = aws_security_group.ecs_instances.id
}
