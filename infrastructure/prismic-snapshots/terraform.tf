terraform {
  required_version = ">= 0.12"

  backend "s3" {
    assume_role = {
      role_arn = "arn:aws:iam::756629837203:role/catalogue-developer"
    }
    bucket   = "wellcomecollection-catalogue-infra-delta"
    key      = "terraform/prismic-backups/prismic_backups.tfstate"
    region   = "eu-west-1"

    dynamodb_table = "terraform-locktable"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

data "terraform_remote_state" "platform_monitoring" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    }

    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/monitoring.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::756629837203:role/catalogue-admin"
  }
}
