locals {
  lambda_name   = "content-prismic-webhook"
  event_trigger = "document-unpublish"
}

module "webhook_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda?ref=v1.2.0"

  name    = local.lambda_name
  runtime = "nodejs24.x"
  handler = "lambda.handler"

  filename    = data.archive_file.empty_zip.output_path
  memory_size = 128
  timeout     = 30

  error_alarm_topic_arn = var.lambda_alarm_topic_arn

  environment = {
    variables = {
      SECRET_NAME    = local.webhook_secret_name
      EVENT_BUS_NAME = aws_cloudwatch_event_bus.document_unpublish_events.name
      EVENT_TRIGGER  = local.event_trigger
    }
  }
}

resource "aws_lambda_function_url" "webhook" {
  function_name      = module.webhook_lambda.lambda.function_name
  authorization_type = "NONE"
}

data "archive_file" "empty_zip" {
  output_path = "data/empty.zip"
  type        = "zip"
  source {
    content  = "// This file is intentionally left empty"
    filename = "lambda.js"
  }
}

data "aws_iam_policy_document" "secrets_access" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = module.secrets.arns
  }
}

data "aws_iam_policy_document" "events_publish" {
  statement {
    effect    = "Allow"
    actions   = ["events:PutEvents"]
    resources = [aws_cloudwatch_event_bus.document_unpublish_events.arn]
  }
}

resource "aws_iam_policy" "secrets_access" {
  name   = "${local.lambda_name}-secrets-access"
  policy = data.aws_iam_policy_document.secrets_access.json
}

resource "aws_iam_policy" "events_publish" {
  name   = "${local.lambda_name}-events-publish"
  policy = data.aws_iam_policy_document.events_publish.json
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_access" {
  role       = module.webhook_lambda.lambda_role.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "lambda_events_publish" {
  role       = module.webhook_lambda.lambda_role.name
  policy_arn = aws_iam_policy.events_publish.arn
}
