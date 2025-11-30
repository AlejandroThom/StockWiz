data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# --- Application Services ---

module "api_gateway" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "api-gateway"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  cluster_name           = module.compute.cluster_name
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/api-gateway"
  image_tag              = var.image_tag
  container_port         = 8000
  memory                 = 1024
  path_pattern           = "/*"
  listener_rule_priority = 100
  create_listener_rule   = true
  desired_count          = 2
  enable_autoscaling     = true
  autoscaling_min_capacity = 2
  autoscaling_max_capacity = 4
  health_check_grace_period_seconds = 60
  environment_variables = [
    { name = "PRODUCT_SERVICE_URL", value = "http://${module.alb.alb_dns_name}/api" },
    { name = "INVENTORY_SERVICE_URL", value = "http://${module.alb.alb_dns_name}/api" },
    { name = "REDIS_URL", value = "${module.db_redis.private_ip}:6379" }
  ]
}

module "product_service" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "product-service"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  cluster_name           = module.compute.cluster_name
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/product-service"
  image_tag              = var.image_tag
  container_port         = 8001
  memory                 = 1024
  path_pattern           = "/api/products*"
  listener_rule_priority = 10
  create_listener_rule   = true
  desired_count          = 2
  enable_autoscaling     = true
  autoscaling_min_capacity = 2
  autoscaling_max_capacity = 4
  health_check_grace_period_seconds = 60
  environment_variables = [
    { name = "DATABASE_URL", value = "postgresql://admin:admin123@${module.db_redis.private_ip}:5432/microservices_db" },
    { name = "REDIS_URL", value = "redis://${module.db_redis.private_ip}:6379" }
  ]
}

module "inventory_service" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "inventory-service"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  cluster_name           = module.compute.cluster_name
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/inventory-service"
  image_tag              = var.image_tag
  container_port         = 8002
  memory                 = 1024
  path_pattern           = "/api/inventory*"
  listener_rule_priority = 20
  create_listener_rule   = true
  desired_count          = 2
  enable_autoscaling     = true
  autoscaling_min_capacity = 2
  autoscaling_max_capacity = 4
  health_check_grace_period_seconds = 60
  environment_variables = [
    { name = "DATABASE_URL", value = "postgres://admin:admin123@${module.db_redis.private_ip}:5432/microservices_db?sslmode=disable" },
    { name = "REDIS_URL", value = "${module.db_redis.private_ip}:6379" }
  ]
}
