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

resource "aws_s3_bucket" "prismic_backup" {
  bucket = "wellcomecollection-content-api-prismic-backup"
}

resource "aws_s3_bucket_acl" "prismic_backup" {
  bucket = aws_s3_bucket.prismic_backup.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "prismic_backup" {
  bucket = aws_s3_bucket.prismic_backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "prismic_backup" {
  bucket = aws_s3_bucket.prismic_backup.id
  rule {
    id     = "expire-backups"
    status = "Enabled"

    expiration {
      days = 90 # 3 months as specified in requirements
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
