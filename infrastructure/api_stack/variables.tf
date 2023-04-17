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

variable "network_config" {
  type = object({
    vpc_id                           = string
    private_subnets                  = set(string)
    ec_privatelink_security_group_id = string
  })
}
