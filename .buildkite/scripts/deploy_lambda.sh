#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

PIPELINE_NAMESPACE=$1
SERVICE_NAME=$2

S3_BUCKET="wellcomecollection-content-api-packages"
S3_KEY="${PIPELINE_NAMESPACE}/${SERVICE_NAME}/${BUILDKITE_COMMIT}.zip"
FUNCTION_NAME="${SERVICE_NAME}-${PIPELINE_NAMESPACE}"

echo "current lambda configuration"
aws lambda get-function-configuration --function-name $FUNCTION_NAME

echo "updating lambda package"
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $S3_BUCKET \
  --s3-key "${PIPELINE_NAMESPACE}/${SERVICE_NAME}.zip"

aws lambda wait function-updated --function-name $FUNCTION_NAME

echo "new lambda configuration"
aws lambda get-function-configuration --function-name $FUNCTION_NAME


