#!/usr/bin/env bash

# Ensure the script will exit if any of the commands in it fail.
set -o errexit

# Set up env vars for this script
PIPELINE_DATE="$1"
export AWS_PROFILE=catalogue-developer
export BUILDKITE_COMMIT=dev
export AWS_PAGER="" # Turn off pager for AWS CLI

# This returns the path to the root of the repo, used later
ROOT=$(git rev-parse --show-toplevel)

# If no pipeline specified, tell the user how to use the script
if [[ -z $PIPELINE_DATE ]]; then
  echo "Usage: ./create_pipeline.sh <PIPELINE_DATE>"
  exit 1
fi

# Ensure there are no unset variables from this point on
set -o nounset

echo "Creating zips for packages ..."
yarn workspace @weco/content-pipeline run package && \
yarn workspace @weco/content-unpublisher run package

echo "Uploading zips to S3 ..."
$ROOT/.buildkite/scripts/upload_lambda_package.sh content-pipeline-$PIPELINE_DATE $ROOT/pipeline/package.zip
$ROOT/.buildkite/scripts/upload_lambda_package.sh content-unpublisher-$PIPELINE_DATE $ROOT/unpublisher/package.zip

echo "Downloading zips from S3 and deploying Lambdas ..."
$ROOT/.buildkite/scripts/deploy_lambda.sh content-pipeline-$PIPELINE_DATE ref.$BUILDKITE_COMMIT
$ROOT/.buildkite/scripts/deploy_lambda.sh content-unpublisher-$PIPELINE_DATE ref.$BUILDKITE_COMMIT

