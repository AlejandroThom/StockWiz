resource "aws_service_discovery_service" "service" {
  name = var.service_name

  dns_config {
    namespace_id = var.namespace_id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  # health_check_custom_config block removed as failure_threshold is deprecated and defaults to 1

}

resource "aws_ecs_task_definition" "service" {
  family             = "${var.project_name}-${var.service_name}"
  execution_role_arn = var.lab_role_arn
  task_role_arn      = var.lab_role_arn
  network_mode       = "bridge"
  cpu                = var.cpu
  memory             = var.memory

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = var.image
      cpu       = var.cpu
      memory    = var.memory
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port # Fixed host port for Service Discovery A records
          protocol      = "tcp"
        }
      ]
      environment = var.environment_variables
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}-${var.service_name}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "service" {
  name            = var.service_name
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = 1

  service_registries {
    registry_arn = aws_service_discovery_service.service.arn
  }
}

resource "aws_cloudwatch_log_group" "service" {
  name              = "/ecs/${var.project_name}-${var.service_name}"
  retention_in_days = 7
}
