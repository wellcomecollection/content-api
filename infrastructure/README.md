# Pipeline management

## Creating pipeline

1. Add new module to `pipeline.tf`, named with the date.
2. Plan and apply Terraform (`terraform init` might be required first)
3. Now your pipeline should have been created, you may confirm so by going into AWS Lambdas as well as ElasticCloud and seeing that it's there.
4. As it's not running in Buildkite, you'll need to define a `$BUILDKITE_COMMIT` in your shell. For example, `BUILDKITE_COMMIT=dev`.
5. Now you need to actually fill the Lambdas with your code. Run command lines from the `publish: pipeline & unpublisher ($LIVE_PIPELINE)` task in `.buildkite/pipeline.yml` locally, skipping `yarn install`.
   - The first two lines are creating zips of the required packages.
   - The last two are to upload those to S3: `AWS_PROFILE=catalogue-developer ./upload_lambda_package.sh [pipeline-name] pipeline/package.zip`
   - Then, you could either go the Lambda service and manually upload them from S3, or use the script we have for it.
     Follow the command lines from `deploy: live pipeline & unpublisher` in `pipeline.yml`, like: `.buildkite/scripts/deploy_lambda.sh [pipeline-name] ref.$BUILDKITE_COMMIT`

To deploy any work locally (e.g. `reindex`), **_remember to change `pipelineDate` values to match your new pipeline's._**.

Once you're happy and want it to become the main pipeline, change the value of `LIVE_PIPELINE` in `.buildkite/pipeline.yml` to match the new one.

## Deleting pipeline

1. Run a targeted destroy on the old pipeline: `terraform destroy -target module.[name]`
2. Remove matching module from `pipeline.tf`
