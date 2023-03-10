locals {
  catalogue_networking = data.terraform_remote_state.accounts_catalogue.outputs
  vpc_id               = local.catalogue_networking["catalogue_vpc_id"]
  private_subnets      = local.catalogue_networking["catalogue_private_subnets"]
}
