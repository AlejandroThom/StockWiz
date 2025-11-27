output "lambda_function_arn" {
  value       = aws_lambda_function.notifier.arn
  description = "ARN of the Discord notifier Lambda function"
}

output "lambda_function_name" {
  value       = aws_lambda_function.notifier.function_name
  description = "Name of the Discord notifier Lambda function"
}

