#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

SERVICE_NAME=$1
ZIP_FILE=$2

S3_BUCKET="wellcomecollection-content-api-packages"
S3_KEY="${SERVICE_NAME}/ref.${BUILDKITE_COMMIT}.zip"

echo "uploading package for $SERVICE_NAME to S3"
aws s3 cp $ZIP_FILE "s3://${S3_BUCKET}/${S3_KEY}"
