resource "aws_ecr_repository" "content_api" {
  name = "weco/content-api"

  lifecycle {
    prevent_destroy = true
  }
}
