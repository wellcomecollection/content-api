locals {
  // This is not the same as the external hostname!
  // It should correspond to the origin domains in the CloudFront distribution:
  // https://github.com/wellcomecollection/platform-infrastructure/blob/main/cloudfront/api.wellcomecollection.org/main.tf
  cert_domain_name = "content.api-${var.environment}.wellcomecollection.org"
}

module "cert" {
  source = "github.com/wellcomecollection/terraform-aws-acm-certificate?ref=v1.0.0"

  domain_name = local.cert_domain_name

  zone_id = data.aws_route53_zone.dotorg.id

  providers = {
    aws.dns = aws.dns
  }
}

data "aws_route53_zone" "dotorg" {
  provider = aws.dns
  name     = "wellcomecollection.org."
}
