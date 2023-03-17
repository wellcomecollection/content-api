module "content_api_stage" {
  source = "./stack"

  environment = "stage"
  api_version = "v0"

  container_image = {
    api = "${aws_ecr_repository.content_api.repository_url}:env.stage"
  }
  desired_task_count = {
    api = 1
  }

  cluster_arn              = aws_ecs_cluster.content_api.arn
  private_subnets          = local.private_subnets
  public_subnets           = local.public_subnets # TODO Only required while APIGW isn't present
  vpc_id                   = local.vpc_id
  elastic_cloud_vpce_sg_id = local.elastic_cloud_vpce_sg_id
}
