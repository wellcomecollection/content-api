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
  default = "e0fd0a21b26600e07ca0748bd64819f058d5e40c"
}
