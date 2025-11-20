variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "stockwiz-test"
}

variable "lab_instance_profile_name" {
  description = "Name of the existing Instance Profile"
  type        = string
  default     = "LabInstanceProfile"
}
