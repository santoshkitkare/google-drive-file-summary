

resource "aws_ecs_task_definition" "task" {
  family                   = local.app_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "app"
    image = var.ecr_image
    portMappings = [{
      containerPort = var.container_port
    }]

    environment = [
      {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      },
      {
        name  = "GOOGLE_CLIENT_SECRET"
        value = var.google_client_secret
      },
      {
        name  = "GOOGLE_REDIRECT_URI"
        value = var.google_redirect_uri
      },
      {
        name  = "OPENAI_API_KEY"
        value = var.openai_api_key
      },
      {
        name  = "OPENAI_MODEL"
        value = var.openai_model
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/drive-file-summary-backend"
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/drive-file-summary-backend"
  retention_in_days = 1
}


resource "aws_ecs_service" "service" {
  name            = local.app_name
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tg.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  depends_on = [
    aws_lb.alb,
    aws_lb_listener.http
  ]
}
