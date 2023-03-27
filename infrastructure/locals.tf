locals {
  catalogue_networking = data.terraform_remote_state.accounts_catalogue.outputs
  shared_infra         = data.terraform_remote_state.infra_critical.outputs

  vpc_id                   = local.catalogue_networking["catalogue_vpc_id"]
  private_subnets          = local.catalogue_networking["catalogue_vpc_private_subnets"]
  elastic_cloud_vpce_sg_id = local.shared_infra["ec_catalogue_privatelink_sg_id"]
  logging_cluster_id       = local.shared_infra["logging_cluster_id"]
}
