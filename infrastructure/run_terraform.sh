#!/usr/bin/env bash

AWS_CLI_PROFILE="content-api-terraform"
CATALOGUE_DEVELOPER_ARN="arn:aws:iam::756629837203:role/catalogue-developer"
API_KEY_SECRET_ID="elastic_cloud/content_api_terraform/api_key"

aws configure set region eu-west-1 --profile $AWS_CLI_PROFILE
aws configure set role_arn "$CATALOGUE_DEVELOPER_ARN" --profile $AWS_CLI_PROFILE
aws configure set source_profile default --profile $AWS_CLI_PROFILE

EC_API_KEY=$(aws secretsmanager get-secret-value --secret-id "$API_KEY_SECRET_ID" --profile "$AWS_CLI_PROFILE" --output text --query 'SecretString')

EC_API_KEY=$EC_API_KEY terraform "$@"
