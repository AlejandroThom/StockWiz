variable "project_name" { type = string }
variable "service_name" { type = string }
variable "cluster_id" { type = string }
variable "lab_role_arn" { type = string }
variable "aws_region" { type = string }
variable "namespace_id" { type = string }

variable "image" { type = string }
variable "container_port" { type = number }

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
