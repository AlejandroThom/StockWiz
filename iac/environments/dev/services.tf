data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# --- Dependencies (Internal Services) ---

module "postgres" {
  source         = "../../modules/internal_service"
  project_name   = var.project_name
  service_name   = "postgres"
  cluster_id     = module.compute.cluster_id
  lab_role_arn   = data.aws_iam_role.lab_role.arn
  aws_region     = var.aws_region
  namespace_id   = module.discovery.namespace_id
  image          = "postgres:15-alpine"
  container_port = 5432
  environment_variables = [
    { name = "POSTGRES_USER", value = "admin" },
    { name = "POSTGRES_PASSWORD", value = "admin123" },
    { name = "POSTGRES_DB", value = "microservices_db" }
  ]
}

module "redis" {
  source         = "../../modules/internal_service"
  project_name   = var.project_name
  service_name   = "redis"
  cluster_id     = module.compute.cluster_id
  lab_role_arn   = data.aws_iam_role.lab_role.arn
  aws_region     = var.aws_region
  namespace_id   = module.discovery.namespace_id
  image          = "redis:7-alpine"
  container_port = 6379
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
  image_repo             = "ghcr.io/mathias/obligatorio-devops/api-gateway"
  image_tag              = var.image_tag
  container_port         = 8080
  path_pattern           = "/*"
  listener_rule_priority = 100
  environment_variables = [
    { name = "PRODUCT_SERVICE_URL", value = "http://product-service.stockwiz.local:8081" },
    { name = "INVENTORY_SERVICE_URL", value = "http://inventory-service.stockwiz.local:8082" },
    { name = "REDIS_URL", value = "redis.stockwiz.local:6379" }
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
  image_repo             = "ghcr.io/mathias/obligatorio-devops/product-service"
  image_tag              = var.image_tag
  container_port         = 8081
  path_pattern           = "/api/products*"
  listener_rule_priority = 10
  environment_variables = [
    { name = "DATABASE_URL", value = "postgresql://admin:admin123@postgres.stockwiz.local:5432/microservices_db" },
    { name = "REDIS_URL", value = "redis://redis.stockwiz.local:6379" }
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
  image_repo             = "ghcr.io/mathias/obligatorio-devops/inventory-service"
  image_tag              = var.image_tag
  container_port         = 8082
  path_pattern           = "/api/inventory*"
  listener_rule_priority = 20
  environment_variables = [
    { name = "DATABASE_URL", value = "postgres://admin:admin123@postgres.stockwiz.local:5432/microservices_db?sslmode=disable" },
    { name = "REDIS_URL", value = "redis.stockwiz.local:6379" }
  ]
}
