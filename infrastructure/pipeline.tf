module "pipeline" {
  source = "./pipeline_stack"

  logging_cluster_id = local.logging_cluster_id
}
