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

resource "aws_s3_bucket_public_access_block" "content_packages" {
  bucket = aws_s3_bucket.content_packages.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
