#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

SERVICE_NAME=$1
PACKAGE_NAME=$2

S3_BUCKET="wellcomecollection-content-api-packages"
S3_KEY="${SERVICE_NAME}/${PACKAGE_NAME}.zip"

echo "current lambda configuration"
aws lambda get-function-configuration --function-name $SERVICE_NAME

echo "updating lambda package"
aws lambda update-function-code \
  --function-name $SERVICE_NAME \
  --s3-bucket $S3_BUCKET \
  --s3-key $S3_KEY

aws lambda wait function-updated --function-name $SERVICE_NAME

echo "new lambda configuration"
aws lambda get-function-configuration --function-name $SERVICE_NAME


