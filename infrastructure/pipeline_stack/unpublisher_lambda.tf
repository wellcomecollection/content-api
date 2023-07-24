locals {
  unpublisher_lambda_name = "content-unpublisher-${var.pipeline_date}"
}

module "unpublisher_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda?ref=v1.2.0"

  name        = local.unpublisher_lambda_name
  description = "Handle any documents which are 'unpublished' (deleted) in Prismic"
  runtime     = "nodejs18.x"
  handler     = "lambda.handler"

  filename    = data.archive_file.empty_zip.output_path
  memory_size = 128
  timeout     = 60

  environment = {
    variables = {
      PIPELINE_DATE = var.pipeline_date
      NODE_OPTIONS  = "--enable-source-maps"
    }
  }

  vpc_config = {
    subnet_ids = var.network_config.private_subnets
    security_group_ids = [
      var.network_config.ec_privatelink_security_group_id,
      aws_security_group.egress.id
    ]
  }

  error_alarm_topic_arn = var.lambda_alarm_topic_arn
}

resource "aws_cloudwatch_event_target" "trigger_unpublisher" {
  rule           = var.unpublish_event_rule.name
  event_bus_name = var.unpublish_event_rule.event_bus_name
  arn            = module.unpublisher_lambda.lambda.arn
}

resource "aws_lambda_permission" "allow_eventbridge_trigger" {
  action        = "lambda:InvokeFunction"
  principal     = "events.amazonaws.com"
  function_name = module.unpublisher_lambda.lambda.function_name
  source_arn    = var.unpublish_event_rule.arn
}

data "aws_iam_policy_document" "unpublisher_secrets_access" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    effect = "Allow"
    resources = concat([
      module.elastic_users["unpublisher"].password_secret_arn,
    ], module.host_secrets.arns)
  }
}


resource "aws_iam_policy" "unpublisher_secrets_access" {
  name   = "${local.unpublisher_lambda_name}-secrets-access"
  policy = data.aws_iam_policy_document.unpublisher_secrets_access.json
}

resource "aws_iam_role_policy_attachment" "unpublisher_lambda_role_attachment" {
  role       = module.unpublisher_lambda.lambda_role.name
  policy_arn = aws_iam_policy.unpublisher_secrets_access.arn
}

