module "pipeline" {
  source = "./pipeline_stack"

  pipeline_date   = "2023-03-24"
  window_duration = "15 minutes"

  logging_cluster_id = local.logging_cluster_id
  network_config     = local.network_config
}
