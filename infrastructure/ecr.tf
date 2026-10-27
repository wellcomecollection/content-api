resource "aws_ecr_repository" "content_api" {
  name = "weco/content-api"

  image_scanning_configuration {
    scan_on_push = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Every main build pushes an image and prod deploys from the latest, so the last 100 covers any rollback.
resource "aws_ecr_lifecycle_policy" "content_api" {
  repository = aws_ecr_repository.content_api.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Only keep the last 100 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 100
        }
        action = { type = "expire" }
      }
    ]
  })
}
