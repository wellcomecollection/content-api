resource "aws_api_gateway_rest_api" "content" {
  name = "Content API (${var.environment})"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_domain_name" "content_api" {
  domain_name              = local.cert_domain_name
  regional_certificate_arn = module.cert.arn
  security_policy          = "TLS_1_2"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_route53_record" "content_api" {
  provider = aws.dns
  name     = aws_api_gateway_domain_name.content_api.domain_name
  zone_id  = data.aws_route53_zone.dotorg.zone_id
  type     = "A"

  alias {
    name                   = aws_api_gateway_domain_name.content_api.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.content_api.regional_zone_id
    evaluate_target_health = false
  }
}


resource "aws_api_gateway_base_path_mapping" "content" {
  base_path   = "content"
  api_id      = aws_api_gateway_rest_api.content.id
  stage_name  = aws_api_gateway_stage.default.stage_name
  domain_name = aws_api_gateway_domain_name.content_api.domain_name

  lifecycle {
    replace_triggered_by = [aws_api_gateway_stage.default.id]
  }
}

// Elsewhere (catalogue, identity APIs) we configure `aws_api_gateway_deployment`s
// with a big list of `triggers.redeployment` and a `lifecycle.create_before_destroy = true
// in order to correctly deploy changes to APIGW. That approach was from here:
// https://github.com/hashicorp/terraform-provider-aws/issues/11344#issuecomment-765138213
// In the content API, we're trying out a lighter touch approach, from here:
// https://github.com/hashicorp/terraform-provider-aws/issues/11344#issuecomment-1358035162
// If you see issues with spurious deploys, changes not appearing, changes disappearing, etc
// then come back and look here, and try manually creating a deployment in the APIGW console.
resource "aws_api_gateway_deployment" "default" {
  rest_api_id = aws_api_gateway_rest_api.content.id
}

resource "aws_api_gateway_stage" "default" {
  stage_name    = "default"
  rest_api_id   = aws_api_gateway_rest_api.content.id
  deployment_id = aws_api_gateway_deployment.default.id

  lifecycle {
    replace_triggered_by = [aws_api_gateway_deployment.default.id]
  }
}

resource "aws_api_gateway_vpc_link" "content_lb" {
  name        = "content-api-load-balancer-${var.environment}"
  target_arns = [aws_lb.content_api.arn]

  lifecycle {
    create_before_destroy = true
  }
}

// /v0
resource "aws_api_gateway_resource" "version" {
  rest_api_id = aws_api_gateway_rest_api.content.id
  parent_id   = aws_api_gateway_rest_api.content.root_resource_id
  path_part   = var.api_version
}

// Routes for articles, exhibitions and events are configured below, but
// all of them point to the sole API service at the moment.

// /v0/articles
module "articles_route" {
  source = "../modules/api_route"

  parent_id   = aws_api_gateway_resource.version.id
  path_part   = "articles"
  http_method = "ANY"

  integration_path = "/articles"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

// /v0/articles/{articleId}
module "single_article_route" {
  source = "../modules/api_route"

  parent_id   = module.articles_route.resource_id
  path_part   = "{articleId}"
  http_method = "ANY"

  path_param       = "articleId"
  integration_path = "/articles/{articleId}"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

// /v0/events
module "events_route" {
  source = "../modules/api_route"

  parent_id   = aws_api_gateway_resource.version.id
  path_part   = "events"
  http_method = "ANY"

  integration_path = "/events"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

// /v0/events/{eventId}
module "single_event_route" {
  source = "../modules/api_route"

  parent_id   = module.events_route.resource_id
  path_part   = "{eventId}"
  http_method = "ANY"

  path_param       = "eventId"
  integration_path = "/events/{eventId}"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

// /v0/exhibitions
module "exhibitions_route" {
  source = "../modules/api_route"

  parent_id   = aws_api_gateway_resource.version.id
  path_part   = "exhibitions"
  http_method = "ANY"

  integration_path = "/exhibitions"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

// /v0/events/{exhibitionId}
module "single_exhibition_route" {
  source = "../modules/api_route"

  parent_id   = module.exhibitions_route.resource_id
  path_part   = "{exhibitionId}"
  http_method = "ANY"

  path_param       = "exhibitionId"
  integration_path = "/exhibitions/{exhibitionId}"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}

module "default_route" {
  source = "../modules/api_route"

  parent_id   = aws_api_gateway_resource.version.id
  path_part   = "{proxy+}"
  http_method = "ANY"

  path_param       = "proxy"
  integration_path = "/{proxy}"
  lb_port          = local.api_lb_port

  external_hostname = var.external_hostname
  rest_api_id       = aws_api_gateway_rest_api.content.id
  vpc_link_id       = aws_api_gateway_vpc_link.content_lb.id
}
