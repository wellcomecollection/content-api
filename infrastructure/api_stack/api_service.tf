locals {
  # These are arbitrary
  api_lb_port  = 8000
  api_app_port = 3333

  apm_secret_config = {
    apm_server_url = "catalogue/api/apm_server_url"
    apm_secret     = "catalogue/api/apm_secret"
  }
}

module "content_api_service" {
  source = "../modules/service_with_sidecar"

  service_name       = "content-api-${var.environment}"
  desired_task_count = var.desired_task_count.api
  container_image    = var.container_image.api
  container_port     = local.api_app_port

  app_cpu    = 256
  app_memory = 512

  environment = {
    PORT             = local.api_app_port
    apm_service_name = "content-api"
    apm_environment  = var.environment
  }
  secrets = local.apm_secret_config

  security_group_ids = [
    aws_security_group.vpc_ingress.id,
    aws_security_group.egress.id,
    var.network_config.ec_privatelink_security_group_id
  ]
  target_group_arn = aws_lb_target_group.content_api.arn

  cluster_arn = var.cluster_arn
  vpc_id      = var.network_config.vpc_id
  subnets     = var.network_config.private_subnets
}

resource "aws_lb_target_group" "content_api" {
  name = "content-api-${var.environment}"

  port        = module.content_api_service.nginx_container_port
  target_type = "ip"
  protocol    = "TCP"
  vpc_id      = var.network_config.vpc_id

  # The default deregistration delay is 5 minutes, which means that ECS
  # takes around 5–7 mins to fully drain connections to and deregister
  # the old task in the course of its blue/green. deployment of an
  # updated service.  Reducing this parameter to 90s makes deployments faster.
  deregistration_delay = 90

  health_check {
    protocol = "HTTP"
    path     = var.healthcheck_path
    matcher  = "200"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "tcp" {
  load_balancer_arn = aws_lb.content_api.arn
  port              = local.api_lb_port
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.content_api.arn
  }
}
