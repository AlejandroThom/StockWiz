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
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/api-gateway"
  image_tag              = var.image_tag
  container_port         = 8000
  memory                 = 128
  path_pattern           = "/*"
  listener_rule_priority = 100
  environment_variables = [
    { name = "PRODUCT_SERVICE_URL", value = "http://${module.alb.alb_dns_name}" },
    { name = "INVENTORY_SERVICE_URL", value = "http://${module.alb.alb_dns_name}" },
    { name = "REDIS_URL", value = "${module.db_redis.private_ip}:6379" }
  ]
}

module "product_service" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "product-service"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/product-service"
  image_tag              = var.image_tag
  container_port         = 8001
  memory                 = 256
  path_pattern           = "/products*"  # Ruta sin /api para uso interno del API Gateway
  listener_rule_priority = 10  
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
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = data.aws_iam_role.lab_role.arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/alejandrothom/stockwiz/inventory-service"
  image_tag              = var.image_tag
  container_port         = 8002
  memory                 = 256
  path_pattern           = "/inventory*"  # Ruta sin /api para uso interno del API Gateway
  listener_rule_priority = 20  
  environment_variables = [
    { name = "DATABASE_URL", value = "postgres://admin:admin123@${module.db_redis.private_ip}:5432/microservices_db?sslmode=disable" },
    { name = "REDIS_URL", value = "${module.db_redis.private_ip}:6379" }
  ]
}
