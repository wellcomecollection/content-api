variable "logging_cluster_id" {
  type = string
}

variable "pipeline_date" {
  type = string
}

variable "network_config" {
  type = object({
    ec_privatelink_security_group_id = string
    ec_traffic_filters               = set(string)
  })
}
