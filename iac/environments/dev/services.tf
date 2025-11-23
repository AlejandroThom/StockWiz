module "api_gateway" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "api-gateway"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = var.lab_role_arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/mathias/obligatorio-devops/api-gateway" # Update with actual repo
  image_tag              = var.image_tag
  container_port         = 8080
  path_pattern           = "/*" # Default catch-all for API Gateway
  listener_rule_priority = 100
}

module "product_service" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "product-service"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = var.lab_role_arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/mathias/obligatorio-devops/product-service"
  image_tag              = var.image_tag
  container_port         = 8081
  path_pattern           = "/api/products*"
  listener_rule_priority = 10
}

module "inventory_service" {
  source                 = "../../modules/service"
  project_name           = var.project_name
  service_name           = "inventory-service"
  vpc_id                 = module.networking.vpc_id
  cluster_id             = module.compute.cluster_id
  alb_listener_arn       = module.alb.listener_arn
  lab_role_arn           = var.lab_role_arn
  aws_region             = var.aws_region
  image_repo             = "ghcr.io/mathias/obligatorio-devops/inventory-service"
  image_tag              = var.image_tag
  container_port         = 8082
  path_pattern           = "/api/inventory*"
  listener_rule_priority = 20
}
