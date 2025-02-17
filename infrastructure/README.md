# Pipeline management

## Creating pipeline

1. Add new module to `pipeline.tf`, named with the date.
2. From `./infrastructure`, plan and apply Terraform (`terraform init` might be required first)
3. Now your pipeline should have been created, you may confirm so by going into AWS Lambdas as well as ElasticCloud and seeing that it's there.

You need to actually fill the Lambdas with your code. For all the steps below, **MAKE SURE YOU ARE SPECIFYING THE NEW PIPELINE'S NAME**, otherwise the default will apply to the live one.
From the project root, run command lines from the `publish: pipeline & unpublisher ($LIVE_PIPELINE)` task in `.buildkite/pipeline.yml` locally, skipping `yarn install`:

1. The first two lines are creating zips of the required packages, you can run them as is.

2. As it's not running the command lines in Buildkite, you'll need to define a `$BUILDKITE_COMMIT` and the correct `AWS_PROFILE` for the next commands:

   - `BUILDKITE_COMMIT=dev` (could be anything, just needs to be defined)
   - `AWS_PROFILE=catalogue-developer`

3. Now upload them to S3:

   - `./.buildkite/scripts/upload_lambda_package.sh content-pipeline-[NEW-PIPELINE-DATE] ./pipeline/package.zip`.
   - `./.buildkite/scripts/upload_lambda_package.sh content-unpublisher-[NEW-PIPELINE-DATE] ./unpublisher/package.zip`.
   - You should now be able to see those zip files in S3.

4. Then, you could either go the Lambda service and manually upload them from S3, or use the script we have for it. If so, follow the command lines from `deploy: live pipeline & unpublisher` in `pipeline.yml`:

   - `.buildkite/scripts/deploy_lambda.sh content-pipeline-[NEW-PIPELINE-DATE] ref.$BUILDKITE_COMMIT`
   - `.buildkite/scripts/deploy_lambda.sh content-unpublisher-[NEW-PIPELINE-DATE] ref.$BUILDKITE_COMMIT`
   - Your Lambdas should now have the correct code uploaded in them.

5. The Elasticsearch indexes will have been created and configured, but you'll need to index them manually. The scheduler will be set but only considers the last 15 minutes of documents being published, so the inital run has to be manual (we could automate that in a different piece of work).

To deploy any work locally (e.g. `reindex`), **_remember to change `pipelineDate` values locally to match your new pipeline's._**. Otherwise you'll be doing those in the live pipeline.

Once you're happy and want it to become the main pipeline, change the value of `LIVE_PIPELINE` in `.buildkite/pipeline.yml` to match the new one. Also ensure that all `pipelineDate` values match the new one.

## Deleting pipeline

1. Make sure the old pipeline is not used by the API [by consulting the /\_elasticConfig endpoint](http://api.wellcomecollection.org/content/v0/_elasticConfig).
2. Run a targeted destroy on the old pipeline using the `run_terraform` script:
   `./run_terraform.sh destroy -target module.[name]`.
   Changes should only relate to the named pipeline, check that before you apply.
3. Changes will take a long time to apply, think over 20 mins. Let it run. Once it's done, you can check in AWS Lambdas that it's been removed, same for Elastic Cloud.
4. Remove matching module from `pipeline.tf`. If you run `terraform plan`, you should get `"No changes. Your infrastructure matches the configuration."`.
5. Make a PR for the module removal to ensure `main` is up-to-date.
