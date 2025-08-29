locals {
  pipeline_lambda_name = "content-pipeline-${var.pipeline_date}"
}

module "pipeline_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda?ref=v1.2.0"

  name    = local.pipeline_lambda_name
  runtime = "nodejs20.x"
  handler = "lambda.handler"

  filename    = data.archive_file.empty_zip.output_path
  memory_size = 512
  timeout     = 10 * 60 // 10 minutes

  environment = {
    variables = {
      PIPELINE_DATE        = var.pipeline_date
      NODE_OPTIONS         = "--enable-source-maps"
      BACKUP_BUCKET_NAME   = var.backup_bucket_name
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

data "archive_file" "empty_zip" {
  output_path = "data/empty.zip"
  type        = "zip"
  source {
    content  = "// This file is intentionally left empty"
    filename = "lambda.js"
  }
}

data "aws_iam_policy_document" "pipeline_secrets_access" {
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

data "aws_iam_policy_document" "pipeline_s3_backup_access" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl"
    ]
    effect = "Allow"
    resources = ["${var.backup_bucket_arn}/*"]
  }
}

resource "aws_iam_policy" "pipeline_secrets_access" {
  name   = "${local.pipeline_lambda_name}-secrets-access"
  policy = data.aws_iam_policy_document.pipeline_secrets_access.json
}

resource "aws_iam_policy" "pipeline_s3_backup_access" {
  name   = "${local.pipeline_lambda_name}-s3-backup-access"
  policy = data.aws_iam_policy_document.pipeline_s3_backup_access.json
}

resource "aws_iam_role_policy_attachment" "pipeline_lambda_role_attachment" {
  role       = module.pipeline_lambda.lambda_role.name
  policy_arn = aws_iam_policy.pipeline_secrets_access.arn
}

resource "aws_iam_role_policy_attachment" "pipeline_lambda_s3_backup_attachment" {
  role       = module.pipeline_lambda.lambda_role.name
  policy_arn = aws_iam_policy.pipeline_s3_backup_access.arn
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
