resource "aws_scheduler_schedule" "windows" {
  name                = "content-pipeline-windows-${var.pipeline_date}"
  schedule_expression = "rate(${var.window_duration_minutes} minutes)"

  // Using the templated Lambda target
  // https://docs.aws.amazon.com/scheduler/latest/UserGuide/managing-targets-templated.html
  target {
    arn      = module.pipeline_lambda.lambda.arn
    role_arn = aws_iam_role.scheduler.arn

    // The awkward replace(s) here are to do with a quirk of how TF
    // serialises angle brackets:
    // https://github.com/hashicorp/terraform-provider-aws/issues/23496
    // https://github.com/hashicorp/terraform/pull/18871#issuecomment-422220699
    input = replace(replace(jsonencode({
      contentType = "all",
      end         = "<aws.scheduler.scheduled-time>"
      // Make sure that we don't lose anything between windows
      duration = "${var.window_duration_minutes + var.window_overlap_minutes} minutes"
    }), "\\u003e", ">"), "\\u003c", "<")
  }

  flexible_time_window {
    mode = "OFF"
  }
}

resource "aws_iam_role" "scheduler" {
  name               = "concept-pipeline-windows-${var.pipeline_date}"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json

  inline_policy {
    name   = "invoke-lambda"
    policy = data.aws_iam_policy_document.scheduler_invoke_lambda.json
  }
}

data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["scheduler.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "scheduler_invoke_lambda" {
  statement {
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.pipeline_lambda.lambda.arn]
  }
}

resource "aws_scheduler_schedule" "daily_addressables" {
  name                = "content-pipeline-daily-addressables-${var.pipeline_date}"
  schedule_expression = "rate(24 hours)"

  target {
    arn      = module.pipeline_lambda.lambda.arn
    role_arn = aws_iam_role.scheduler.arn

    input = jsonencode({
      contentType = "addressables"
    })
  }

  flexible_time_window {
    mode = "OFF"
  }
}

resource "aws_scheduler_schedule" "daily_backup" {
  name                = "content-pipeline-daily-backup-${var.pipeline_date}"
  schedule_expression = "rate(24 hours)"

  target {
    arn      = module.pipeline_lambda.lambda.arn
    role_arn = aws_iam_role.scheduler.arn

    input = jsonencode({
      operation = "backup"
    })
  }

  flexible_time_window {
    mode = "OFF"
  }
}
