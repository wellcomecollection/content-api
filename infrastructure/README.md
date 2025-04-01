# Pipeline management

## Creating pipeline

1. Add new module to `pipeline.tf`, named with the date.
2. From `./infrastructure`, plan and apply Terraform (`./run_terraform.sh plan`), although `terraform init` will probably be required first.
3. Now your pipeline should have been created, you may confirm so by going into AWS Lambdas as well as ElasticCloud and seeing that it's there.
4. Run `./create_pipeline.sh [NEW PIPELINE DATE]`.
5. The Elasticsearch indexes will have been created and configured, but you'll need to run a reindex manually. The scheduler will be set but only considers the last 15 minutes of documents being published, so the inital run has to be manual (although it could be made to be automated should we desire it). Before you reindex, **_remember to change `pipelineDate` values locally to match your new pipeline's._**, otherwise you'll be doing those in the live pipeline.

Once you're happy and want it to become the main pipeline, change the value of `LIVE_PIPELINE` in `.buildkite/pipeline.yml` to match the new one. Double check that all `pipelineDate` values match the new one.

## Deleting pipeline

1. Make sure the old pipeline is not used by the API [by consulting the /\_elasticConfig endpoint](http://api.wellcomecollection.org/content/v0/_elasticConfig).
2. Run a targeted destroy on the old pipeline using the `run_terraform` script:
   `./run_terraform.sh destroy -target module.[name]`.
   Changes should only relate to the named pipeline, check that before you apply.
3. Changes will take a long time to apply, think over 20 mins. Let it run. Once it's done, you can check in [AWS Lambdas](https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions) that it's been removed, same for [Elastic Cloud](https://cloud.elastic.co/deployments).
4. Remove matching module from `pipeline.tf`. If you run `./run_terraform.sh plan`, you should get `"No changes. Your infrastructure matches the configuration."`.
5. Make a PR for the module removal to ensure `main` is up-to-date.
