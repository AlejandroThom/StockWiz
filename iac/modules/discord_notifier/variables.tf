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

