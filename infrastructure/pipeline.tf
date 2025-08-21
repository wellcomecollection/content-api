module "pipeline_2025-07-30" {
  source                  = "./pipeline_stack"
  pipeline_date           = "2025-07-30"
  window_duration_minutes = 15
  deployment_template_id  = "aws-storage-optimized"
  logging_cluster_id      = local.logging_cluster_id
  network_config          = local.network_config
  lambda_alarm_topic_arn  = local.catalogue_lambda_alarn_topic_arn

  unpublish_event_rule = module.webhook.unpublish_event_rule
}
