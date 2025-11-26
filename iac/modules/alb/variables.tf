variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_sg_id" {
  type = string
}

variable "api_gateway_target_group_arn" {
  type        = string
  default     = null
  description = "ARN of the API Gateway target group to use as default action"
}