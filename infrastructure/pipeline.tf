module "pipeline" {
  source = "./pipeline_stack"

  pipeline_date = "2023-03-24"

  logging_cluster_id = local.logging_cluster_id
}
