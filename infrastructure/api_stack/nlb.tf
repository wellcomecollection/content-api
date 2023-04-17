resource "aws_lb" "content_api" {
  name                             = "content-api-${var.environment}"
  internal                         = true
  load_balancer_type               = "network"
  subnets                          = var.network_config.private_subnets
  enable_cross_zone_load_balancing = local.should_cross_zone_lb
}

locals {
  # Network load balancers can't route across availability zones by default, so
  # need to be told to if there are fewer tasks than AZs
  min_task_count       = min([for service, count in var.desired_task_count : count]...)
  should_cross_zone_lb = local.min_task_count < 3
}
