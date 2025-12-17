# Source of Prismic secrets
data "aws_secretsmanager_secret_version" "prismic_access_token" {
  secret_id = "prismic/backup-prod/access-token"
}

data "aws_secretsmanager_secret_version" "prismic_bearer_token" {
  secret_id = "prismic/backup-prod/bearer-token"
}