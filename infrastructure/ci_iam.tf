locals {
  ci_role_name = trimprefix(data.aws_arn.ci_role.resource, "role/")
}

data "aws_arn" "ci_role" {
  arn = local.ci_role_arn
}

resource "aws_iam_role_policy" "ci_s3_publish" {
  role   = local.ci_role_name
  policy = data.aws_iam_policy_document.ci_s3_publish.json
}

data "aws_iam_policy_document" "ci_s3_publish" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject"
    ]
    resources = [
      aws_s3_bucket.content_packages.arn,
      "${aws_s3_bucket.content_packages.arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "ci_lambda_update" {
  role   = local.ci_role_name
  policy = data.aws_iam_policy_document.ci_lambda_update.json
}

data "aws_iam_policy_document" "ci_lambda_update" {
  statement {
    effect = "Allow"
    actions = [
      "lambda:GetFunctionConfiguration",
      "lambda:UpdateFunctionCode",
      "lambda:UpdateFunctionConfiguration",
    ]
    resources = ["arn:aws:lambda:eu-west-1:756629837203:function:content-pipeline-*"]
  }
}
