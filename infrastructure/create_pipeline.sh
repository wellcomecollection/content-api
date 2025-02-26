#!/usr/bin/env bash

echo Assign variables
for ARGUMENT in "$@"
do
   KEY=$(echo $ARGUMENT | cut -f1 -d=)

   KEY_LENGTH=${#KEY}
   VALUE="${ARGUMENT:$KEY_LENGTH+1}"

   export "$KEY"="$VALUE"
done

echo Ensure all necessary variables have been declared
if [[ -z $PIPELINE_DATE || -z $AWS_PROFILE || -z $BUILDKITE_COMMIT ]]; then
  echo "ERROR: PIPELINE_DATE, BUILDKITE_COMMIT and AWS_PROFILE are mandatory arguments.";
  exit 1;
fi

echo "Creating zips for packages ..."
yarn workspace @weco/content-pipeline run package && yarn workspace @weco/content-unpublisher run package

echo "Uploading zips to S3 ..."
bash ../.buildkite/scripts/upload_lambda_package.sh content-pipeline-$PIPELINE_DATE ../pipeline/package.zip $AWS_PROFILE=$AWS_PROFILE $BUILDKITE_COMMIT=$BUILDKITE_COMMIT
bash ../.buildkite/scripts/upload_lambda_package.sh content-unpublisher-$PIPELINE_DATE ../unpublisher/package.zip $AWS_PROFILE=$AWS_PROFILE $BUILDKITE_COMMIT=$BUILDKITE_COMMIT

echo Get zips in S3 and deploy them to our Lambdas
bash ../.buildkite/scripts/deploy_lambda.sh content-pipeline-$PIPELINE_DATE ref.$BUILDKITE_COMMIT
bash ../.buildkite/scripts/deploy_lambda.sh content-unpublisher-$PIPELINE_DATE ref.$BUILDKITE_COMMIT

