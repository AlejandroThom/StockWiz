variable "project_name" { type = string }
variable "service_name" { type = string }
variable "vpc_id" { type = string }
variable "cluster_id" { type = string }
variable "alb_listener_arn" {
  type        = string
  default     = null
  description = "ARN of the ALB listener (null to skip listener rule creation)"
}
variable "lab_role_arn" { type = string }
variable "aws_region" { type = string }

variable "image_repo" { type = string }
variable "image_tag" { type = string }

variable "container_port" {
  type    = number
  default = 80
}

variable "path_pattern" {
  type        = string
  default     = null
  description = "Path pattern for ALB routing (e.g. /api/products*). Null to skip listener rule creation."
}

variable "health_check_path" {
  type    = string
  default = "/health"
}

variable "listener_rule_priority" {
  type        = number
  default     = null
  description = "Priority for the ALB listener rule (must be unique). Null to skip listener rule creation."
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "environment_variables" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "repository_credentials_secret_arn" {
  type        = string
  default     = null
  description = "ARN of the AWS Secrets Manager secret containing Docker registry credentials (for private repos like GHCR)"
}