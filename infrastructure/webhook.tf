module "webhook" {
  source                 = "./webhook_stack"
  lambda_alarm_topic_arn = local.catalogue_lambda_alarn_topic_arn
}
