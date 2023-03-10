resource "aws_ecr_repository" "concepts_api" {
  name = "weco/content-api"

  lifecycle {
    prevent_destroy = true
  }
}
