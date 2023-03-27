locals {
  indices = {
    articles = "articles"
  }
  service_roles = {
    api = [
      "${local.indices.articles}_read"
    ]
    pipeline = [
      "${local.indices.articles}_read",
      "${local.indices.articles}_write"
    ]
  }
}

resource "elasticstack_elasticsearch_security_role" "read_indices" {
  for_each = toset(values(local.indices))

  name = "${each.key}_read"
  indices {
    names      = ["${each.key}*"]
    privileges = ["read", "monitor", "view_index_metadata"]
  }
}

resource "elasticstack_elasticsearch_security_role" "write_indices" {
  for_each = toset(values(local.indices))

  name = "${each.key}_write"
  indices {
    names = ["${each.key}*"]
    // See https://www.elastic.co/guide/en/elasticsearch/reference/current/security-privileges.html#privileges-list-indices for details
    // This doesn't allow index deletion (but does allow document deletion)
    privileges = ["create_index", "index", "create", "delete"]
  }
}

module "elastic_users" {
  source   = "../modules/elastic_user"
  for_each = local.service_roles

  username = each.key
  roles    = each.value

  cluster_name = ec_deployment.content_cluster.name
}
