#!/usr/bin/env bash

# The key is under admin/, which only catalogue-admin can read
AWS_CLI_PROFILE="content-api-terraform-admin"
CATALOGUE_ADMIN_ARN="arn:aws:iam::756629837203:role/catalogue-admin"
API_KEY_SECRET_ID="admin/elastic_cloud/terraform_content"

aws configure set region eu-west-1 --profile $AWS_CLI_PROFILE
aws configure set role_arn "$CATALOGUE_ADMIN_ARN" --profile $AWS_CLI_PROFILE
aws configure set source_profile default --profile $AWS_CLI_PROFILE

EC_API_KEY=$(aws secretsmanager get-secret-value --secret-id "$API_KEY_SECRET_ID" --profile "$AWS_CLI_PROFILE" --output text --query 'SecretString')

EC_API_KEY=$EC_API_KEY terraform "$@"
