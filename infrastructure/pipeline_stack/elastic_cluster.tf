locals {
  elastic_cloud_region = data.aws_region.current.name
  cluster_id           = ec_deployment.content_cluster.elasticsearch.resource_id
  cluster_alias        = ec_deployment.content_cluster.alias
  cluster_public_host  = "${local.cluster_alias}.es.${local.elastic_cloud_region}.aws.found.io"
  cluster_private_host = "${local.cluster_id}.vpce.${local.elastic_cloud_region}.aws.elastic-cloud.com"
}

resource "ec_deployment" "content_cluster" {
  name  = "content-${var.pipeline_date}"
  alias = "content-${var.pipeline_date}"

  version                = data.ec_stack.latest_patch.version
  region                 = local.elastic_cloud_region
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

resource "ec_deployment_traffic_filter_association" "content_cluster" {
  for_each = var.network_config.ec_traffic_filters

  deployment_id     = ec_deployment.content_cluster.id
  traffic_filter_id = each.value
}

data "ec_stack" "latest_patch" {
  version_regex = "8.6.?"
  region        = local.elastic_cloud_region
}

data "aws_region" "current" {}

module "host_secrets" {
  source = "github.com/wellcomecollection/terraform-aws-secrets?ref=v1.4.0"

  key_value_map = {
    "elasticsearch/${ec_deployment.content_cluster.name}/public_host"  = local.cluster_public_host
    "elasticsearch/${ec_deployment.content_cluster.name}/private_host" = local.cluster_private_host
  }
}
