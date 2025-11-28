variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "cluster_name" {
  description = "ECS Cluster Name"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN Suffix of the Application Load Balancer"
  type        = string
}
