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
  # Canary for aws-for-fluent-bit 3.5.5 (wellcomecollection/platform-infrastructure#601, wellcomecollection/platform-infrastructure#609).
  log_router_container_tag = "d50a271ebd110b5a181bfde89f06a96e51d2f88d"

  desired_task_count = {
    api = 1
  }

  cluster_arn    = aws_ecs_cluster.content_api.arn
  network_config = local.network_config

  providers = {
    aws.dns = aws.dns
  }
}
