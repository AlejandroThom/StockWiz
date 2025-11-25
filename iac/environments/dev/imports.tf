import {
  to = module.compute.aws_ecs_capacity_provider.main
  id = "stockwiz-dev-capacity-provider"
}

import {
  to = module.redis.aws_cloudwatch_log_group.service
  id = "/ecs/stockwiz-dev-redis"
}

import {
  to = module.postgres.aws_cloudwatch_log_group.service
  id = "/ecs/stockwiz-dev-postgres"
}

import {
  to = module.api_gateway.aws_cloudwatch_log_group.service
  id = "/ecs/stockwiz-dev-api-gateway"
}

import {
  to = module.product_service.aws_cloudwatch_log_group.service
  id = "/ecs/stockwiz-dev-product-service"
}

import {
  to = module.inventory_service.aws_cloudwatch_log_group.service
  id = "/ecs/stockwiz-dev-inventory-service"
}

import {
  to = module.inventory_service.aws_ecs_service.service
  id = "stockwiz-dev-cluster/inventory-service"
}

import {
  to = module.product_service.aws_ecs_service.service
  id = "stockwiz-dev-cluster/product-service"
}

import {
  to = module.api_gateway.aws_ecs_service.service
  id = "stockwiz-dev-cluster/api-gateway"
}
