provider "aws" {
  region = var.aws_region
}

terraform {
  backend "s3" {
    bucket         = "obligatorio-devops-tf-state-123"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "obligatorio-devops-tf-locks-123"
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
  asg_min_size          = 1
  asg_max_size          = 2
  asg_desired_capacity  = 1
}

module "discovery" {
  source         = "../../modules/discovery"
  project_name   = var.project_name
  vpc_id         = module.networking.vpc_id
  namespace_name = "stockwiz.local"
}
