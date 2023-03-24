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

  cluster_arn              = aws_ecs_cluster.content_api.arn
  private_subnets          = local.private_subnets
  vpc_id                   = local.vpc_id
  elastic_cloud_vpce_sg_id = local.elastic_cloud_vpce_sg_id

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
  desired_task_count = {
    api = 1
  }

  cluster_arn              = aws_ecs_cluster.content_api.arn
  private_subnets          = local.private_subnets
  vpc_id                   = local.vpc_id
  elastic_cloud_vpce_sg_id = local.elastic_cloud_vpce_sg_id

  providers = {
    aws.dns = aws.dns
  }
}
