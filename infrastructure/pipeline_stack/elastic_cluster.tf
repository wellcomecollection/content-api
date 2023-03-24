resource "ec_deployment" "content_cluster" {
  name  = "content-${var.pipeline_date}"
  alias = "content-${var.pipeline_date}"

  version                = data.ec_stack.latest_patch.version
  region                 = data.aws_region.current.name
  deployment_template_id = "aws-io-optimized-v3"

  elasticsearch = {
    autoscale = "false"
    hot = {
      size        = "1g"
      zone_count  = 1
      autoscaling = {}
    }
  }

  kibana = {
    size       = "1g"
    zone_count = 1
  }

  observability = {
    deployment_id = var.logging_cluster_id
  }
}

data "ec_stack" "latest_patch" {
  version_regex = "8.6.?"
  region        = data.aws_region.current.name
}

data "aws_region" "current" {}
