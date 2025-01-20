terraform {
  required_providers {
    ec = {
      source = "elastic/ec"
    }
    elasticstack = {
      source = "elastic/elasticstack"
    }
  }
}

provider "elasticstack" {
  elasticsearch {
    username  = ec_deployment.content_cluster.elasticsearch_username
    password  = ec_deployment.content_cluster.elasticsearch_password
    endpoints = ["https://${local.cluster_public_host}:9243"]
  }
}
