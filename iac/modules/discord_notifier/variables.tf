variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "discord_webhook_url" {
  type        = string
  description = "Discord webhook URL for notifications"
  sensitive   = true
}

variable "environment" {
  type        = string
  description = "Environment name (dev, test, prod)"
}

variable "lab_role_arn" {
  type        = string
  description = "ARN of the existing LabRole to use for Lambda execution"
}

