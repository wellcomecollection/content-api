resource "aws_s3_bucket" "content_packages" {
  bucket = "wellcomecollection-content-api-packages"
}

resource "aws_s3_bucket_acl" "content_packages" {
  bucket = aws_s3_bucket.content_packages.id
  acl    = "private"
}

resource "aws_s3_bucket_lifecycle_configuration" "content_packages" {
  bucket = aws_s3_bucket.content_packages.id
  rule {
    id     = "expire-packages"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}
