locals {
  catalogue_account = data.terraform_remote_state.accounts_catalogue.outputs
  shared_infra      = data.terraform_remote_state.infra_critical.outputs

  ci_role_arn        = local.catalogue_account["ci_role_arn"]
  logging_cluster_id = local.shared_infra["logging_cluster_id"]

  network_config = {
    vpc_id                           = local.catalogue_account["catalogue_vpc_id"]
    private_subnets                  = local.catalogue_account["catalogue_vpc_private_subnets"]
    ec_privatelink_security_group_id = local.shared_infra["ec_catalogue_privatelink_sg_id"]
    ec_traffic_filters = [
      local.shared_infra["ec_catalogue_privatelink_traffic_filter_id"],
      local.shared_infra["ec_public_internet_traffic_filter_id"]
    ]
  }
}
