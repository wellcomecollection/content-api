module "content_api_prod" {
  source = "./api_stack"

  environment       = "prod"
  external_hostname = "api.wellcomecollection.org"
  api_version       = "v0"

  container_image = {
    api = "${aws_ecr_repository.content_api.repository_url}:env.prod"
  }
  desired_task_count = {
    api = 1
  }

  cluster_arn    = aws_ecs_cluster.content_api.arn
  network_config = local.network_config

  providers = {
    aws.dns = aws.dns
  }
}

module "content_api_stage" {
  source = "./api_stack"

  environment       = "stage"
  external_hostname = "api-stage.wellcomecollection.org"
  api_version       = "v0"

  container_image = {
    api = "${aws_ecr_repository.content_api.repository_url}:env.stage"
  }
  # Canary for aws-for-fluent-bit 3.5.5 (wellcomecollection/platform-infrastructure#601).
  log_router_container_tag = "f4da802a657cec42381e6af1f38418faa3b6fd68"

  desired_task_count = {
    api = 1
  }

  cluster_arn    = aws_ecs_cluster.content_api.arn
  network_config = local.network_config

  providers = {
    aws.dns = aws.dns
  }
}
