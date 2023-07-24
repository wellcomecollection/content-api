locals {
  webhook_secret_name = "prismic/webhook/unpublish-secret"
}

resource "random_password" "webhook_secret" {
  length = 64
}

module "secrets" {
  source = "github.com/wellcomecollection/terraform-aws-secrets?ref=v1.4.0"

  deletion_mode = "IMMEDIATE"
  key_value_map = {
    "${local.webhook_secret_name}" = random_password.webhook_secret.result
  }
}
