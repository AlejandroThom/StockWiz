variable "project_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_id" { type = string }
variable "ecs_sg_id" { type = string }

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "volume_size" {
  type    = number
  default = 20
}

variable "postgres_user" {
  type    = string
  default = "admin"
}

variable "postgres_password" {
  type    = string
  default = "admin123"
}

variable "postgres_db" {
  type    = string
  default = "microservices_db"
}

variable "key_name" {
  type    = string
  default = null
}


