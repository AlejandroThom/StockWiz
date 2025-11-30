provider "aws" {
  region = var.aws_region
}

terraform {
  backend "s3" {
    bucket         = "alejandrothom-stockwiz-tf-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "alejandrothom-stockwiz-tf-locks"
    encrypt        = true
  }
}

module "networking" {
  source       = "../../modules/networking"
  project_name = var.project_name
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
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
  instance_type         = "t3.large"
  asg_min_size          = 2
  asg_max_size          = 4
  asg_desired_capacity  = 2
}

module "db_redis" {
  source            = "../../modules/db_redis"
  project_name      = var.project_name
  vpc_id            = module.networking.vpc_id
  subnet_id         = module.networking.public_subnet_ids[0]
  ecs_sg_id         = module.security.ecs_instances_sg_id
  instance_type     = "t3.large"
  volume_size       = 50
  postgres_user     = "admin"
  postgres_password = "admin123"
  postgres_db       = "microservices_db"
}

module "discord_notifier" {
  count = var.discord_webhook_url != "" ? 1 : 0

  source              = "../../modules/discord_notifier"
  project_name        = var.project_name
  discord_webhook_url = var.discord_webhook_url
  environment         = "dev"
  lab_role_arn        = data.aws_iam_role.lab_role.arn
}

module "cloudwatch" {
  source         = "../../modules/cloudwatch"
  project_name   = var.project_name
  environment    = "dev"
  aws_region     = var.aws_region
  cluster_name   = module.compute.cluster_name
  alb_arn_suffix = module.alb.alb_arn_suffix
}
