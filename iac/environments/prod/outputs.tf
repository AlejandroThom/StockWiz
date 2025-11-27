output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.alb.alb_dns_name
}

output "discord_notifier_function_name" {
  description = "Name of the Discord notifier Lambda function"
  value       = length(module.discord_notifier) > 0 ? module.discord_notifier[0].lambda_function_name : null
}