resource "aws_lb_target_group" "service" {
  name        = "${var.project_name}-${var.service_name}"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance" # EC2 Launch Type

  health_check {
    path                = var.health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

resource "aws_lb_listener_rule" "service" {
  count = var.create_listener_rule ? 1 : 0

  listener_arn = var.alb_listener_arn
  priority     = var.listener_rule_priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service.arn
  }

  condition {
    path_pattern {
      values = [var.path_pattern]
    }
  }
}

resource "aws_ecs_task_definition" "service" {
  family             = "${var.project_name}-${var.service_name}"
  execution_role_arn = var.lab_role_arn # Using LabRole for execution
  task_role_arn      = var.lab_role_arn # Using LabRole for task permissions
  network_mode       = "bridge"         # Bridge for EC2
  cpu                = var.cpu
  memory             = var.memory

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = "${var.image_repo}:${var.image_tag}"
      cpu       = var.cpu
      memory    = var.memory
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = var.environment_variables
      repositoryCredentials = var.repository_credentials_secret_arn != null ? {
        credentialsParameter = var.repository_credentials_secret_arn
      } : null
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
  name                 = var.service_name
  cluster              = var.cluster_id
  task_definition      = aws_ecs_task_definition.service.arn
  desired_count        = var.desired_count
  force_new_deployment = true

  # Allow external changes (CI/CD) to task_definition and desired_count without drift
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.service.arn
    container_name   = var.service_name
    container_port   = var.container_port
  }
}

resource "aws_cloudwatch_log_group" "service" {
  name              = "/ecs/${var.project_name}-${var.service_name}"
  retention_in_days = 7
}
