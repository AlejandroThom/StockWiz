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

variable "image_tag" {
  description = "Tag of the container images to deploy"
  type        = string
  default     = "dev-latest"
}
