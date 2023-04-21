variable "logging_cluster_id" {
  type = string
}

variable "pipeline_date" {
  type = string
}

variable "network_config" {
  type = object({
    vpc_id                           = string
    private_subnets                  = set(string)
    ec_privatelink_security_group_id = string
    ec_traffic_filters               = set(string)
  })
}

variable "window_duration_minutes" {
  type = number
}

variable "window_overlap_minutes" {
  type    = number
  default = 1
}
