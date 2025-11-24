variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "stockwiz-dev"
}

variable "lab_instance_profile_name" {
  description = "Name of the existing Instance Profile"
  type        = string
  default     = "LabInstanceProfile"
}

variable "lab_role_arn" {
  description = "ARN of the LabRole for ECS Task Execution"
  type        = string
}

variable "image_tag" {
  description = "Tag of the container images to deploy"
  type        = string
  default     = "dev-latest"
}
