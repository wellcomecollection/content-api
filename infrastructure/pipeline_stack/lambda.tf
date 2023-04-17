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

resource "aws_security_group" "egress" {
  name        = "content-pipeline-${var.pipeline_date}-egress"
  description = "Allows all egress traffic from the group"
  vpc_id      = var.network_config.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
