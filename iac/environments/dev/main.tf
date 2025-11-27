provider "aws" {
  region = var.aws_region
}

terraform {
  backend "s3" {
    bucket         = "obligatorio-devops-tf-state-1234"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "obligatorio-devops-tf-locks-1234"
    encrypt        = true
  }
}

module "networking" {
  source       = "../../modules/networking"
  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
}

module "security" {
  source       = "../../modules/security"
  project_name = var.project_name
  vpc_id       = module.networking.vpc_id
}

module "alb" {
  source            = "../../modules/alb"
  project_name      = var.project_name
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
}

module "compute" {
  source                = "../../modules/compute"
  project_name          = var.project_name
  subnet_ids            = module.networking.public_subnet_ids
  ecs_sg_id             = module.security.ecs_instances_sg_id
  instance_profile_name = var.lab_instance_profile_name
  instance_type         = "t3.small"
  asg_min_size          = 1
  asg_max_size          = 4
  asg_desired_capacity  = 2
}

module "db_redis" {
  source            = "../../modules/db_redis"
  project_name      = var.project_name
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.public_subnet_ids[0]
  ecs_sg_id         = module.security.ecs_instances_sg_id
  instance_type     = "t3.micro"
  volume_size       = 20
  postgres_user     = "admin"
  postgres_password = "admin123"
  postgres_db       = "microservices_db"
}
