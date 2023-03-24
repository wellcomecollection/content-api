resource "ec_deployment" "cluster" {
  name  = "content"
  alias = "content"

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

  observability {
    deployment_id = var.logging_cluster_id
  }
}

data "ec_stack" "latest_patch" {
  version_regex = "8.6.?"
  region        = data.aws_region.current.name
}

data "aws_region" "current" {}
