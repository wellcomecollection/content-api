resource "aws_acm_certificate" "content_api" {
  domain_name       = "content.${var.external_hostname}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

data "aws_route53_zone" "dotorg" {
  provider = aws.dns
  name     = "wellcomecollection.org."
}

resource "aws_route53_record" "content_certificate_validation" {
  provider = aws.dns
  for_each = {
    for dvo in aws_acm_certificate.content_api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.dotorg.zone_id
}

resource "aws_acm_certificate_validation" "content" {
  certificate_arn         = aws_acm_certificate.content_api.arn
  validation_record_fqdns = [for record in aws_route53_record.content_certificate_validation : record.fqdn]
}
