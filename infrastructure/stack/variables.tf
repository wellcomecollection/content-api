variable "environment" {
  type = string
}

variable "cluster_arn" {
  type = string
}

variable "private_subnets" {
  type = set(string)
}

# TODO Only required while APIGW isn't present
variable "public_subnets" {
  type = set(string)
}

variable "vpc_id" {
  type = string
}

variable "elastic_cloud_vpce_sg_id" {
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
