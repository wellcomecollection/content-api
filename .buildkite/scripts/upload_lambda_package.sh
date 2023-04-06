#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

PIPELINE_NAMESPACE=$1
SERVICE_NAME=$2
ZIP_FILE=$3

S3_BUCKET="wellcomecollection-content-api-packages"
S3_KEY="${PIPELINE_NAMESPACE}/${SERVICE_NAME}/${BUILDKITE_COMMIT}.zip"

echo "uploading package for $SERVICE_NAME to S3"
aws s3 cp $ZIP_FILE "s3://${S3_BUCKET}/${S3_KEY}"
