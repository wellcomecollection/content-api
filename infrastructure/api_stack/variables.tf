variable "environment" {
  type = string
}

variable "cluster_arn" {
  type = string
}

variable "desired_task_count" {
  type = object({
    api = number
  })
}

variable "container_image" {
  type = object({
    api = string
  })
}

variable "api_version" {
  type = string
}

variable "external_hostname" {
  type = string
}

variable "healthcheck_path" {
  type    = string
  default = "/management/healthcheck"
}

variable "network_config" {
  type = object({
    vpc_id                           = string
    private_subnets                  = set(string)
    ec_privatelink_security_group_id = string
  })
}

variable "log_router_container_tag" {
  type    = string
  default = "0b9948b83bfb68e4481ed988f15ede80239e4879"
}
