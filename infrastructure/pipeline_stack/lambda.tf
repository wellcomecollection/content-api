locals {
  lambda_name = "content-pipeline-${var.pipeline_date}"
}

module "pipeline_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda?ref=v1.1.1"

  name    = local.lambda_name
  runtime = "nodejs18.x"
  handler = "lambda.handler"

  filename    = data.archive_file.empty_zip.output_path
  memory_size = 512
  timeout     = 10 * 60 // 10 minutes

  environment = {
    variables = {
      PIPELINE_DATE = var.pipeline_date
    }
  }
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
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    effect = "Allow"
    resources = concat([
      module.elastic_users["pipeline"].password_secret_arn,
    ], module.host_secrets.arns)
  }
}


resource "aws_iam_policy" "secrets_access" {
  name   = "${local.lambda_name}-secrets-access"
  policy = data.aws_iam_policy_document.secrets_access.json
}

resource "aws_iam_role_policy_attachment" "lambda_role_attachment" {
  role       = module.pipeline_lambda.lambda_role.name
  policy_arn = aws_iam_policy.secrets_access.arn
}
