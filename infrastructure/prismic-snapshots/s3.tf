# S3 bucket for storing Prismic backups
resource "aws_s3_bucket" "prismic_backups" {
  bucket = "wellcomecollection-prismic-backups"
}

resource "aws_s3_bucket_lifecycle_configuration" "prismic_snapshots" {
  bucket = aws_s3_bucket.prismic_snapshots.id

  rule {
    id     = "delete_old_snapshots"
    status = "Enabled"

    filter {
      prefix = "snapshots/"
    }

    expiration {
      days = 14
    }

    noncurrent_version_expiration {
      noncurrent_days = 1
    }
  }
}


# Upload README to S3 bucket for documentation
resource "aws_s3_object" "bucket_readme" {
  bucket       = aws_s3_bucket.prismic_snapshots.bucket
  key          = "README.md"
  source       = "${path.module}/bucket-readme.md"
  content_type = "text/markdown"

  # Update when the README content changes
  etag = filemd5("${path.module}/bucket-readme.md")

  tags = {
    Name        = "Prismic Snapshots Bucket README"
    Environment = "production"
    Purpose     = "documentation"
  }
}