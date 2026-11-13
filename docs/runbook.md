# Content API runbook

The Content API serves articles, events, exhibitions and other Prismic content to search and listing pages on wellcomecollection.org, and to anyone using the public API.

- **Backplane:** [content-api](https://backplane.wellcome.digital/catalog/system/default/content-api) (internal). The owning team, its contact channel and any suppliers sharing the service are on that page.
- **Code:** [wellcomecollection/content-api](https://github.com/wellcomecollection/content-api)
- **Last reviewed:** 2026-11-13, first draft

## What it is

The Content API is a System of five parts, all in the catalogue AWS account in eu-west-1. A pipeline Lambda copies changed Prismic documents into an Elastic Cloud cluster every 15 minutes, and reloads all addressables (the documents behind the main site search) once a day. An Express service on ECS answers queries from that cluster. A Prismic webhook tells an unpublisher Lambda to remove documents that editors unpublish. Separately, a nightly job backs up all Prismic documents and media to S3.

| Part            | Backplane Component                                                                                                        | Runs as                                                                                                                   | Code                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| API             | [content-api](https://backplane.wellcome.digital/catalog/component/default/content-api) (internal)                         | ECS services `content-api-prod` and `content-api-stage` in cluster `content-api`, behind API Gateway                      | [api/](https://github.com/wellcomecollection/content-api/tree/main/api)                                                           |
| Pipeline        | [content-pipeline](https://backplane.wellcome.digital/catalog/component/default/content-pipeline) (internal)               | Lambda `content-pipeline-{date}`, run by EventBridge Scheduler                                                            | [pipeline/](https://github.com/wellcomecollection/content-api/tree/main/pipeline)                                                 |
| Webhook         | [content-prismic-webhook](https://backplane.wellcome.digital/catalog/component/default/content-prismic-webhook) (internal) | Lambda `content-prismic-webhook` behind a function URL                                                                    | [webhook/](https://github.com/wellcomecollection/content-api/tree/main/webhook)                                                   |
| Unpublisher     | [content-unpublisher](https://backplane.wellcome.digital/catalog/component/default/content-unpublisher) (internal)         | Lambda `content-unpublisher-{date}`, triggered from EventBridge                                                           | [unpublisher/](https://github.com/wellcomecollection/content-api/tree/main/unpublisher)                                           |
| Prismic backups | [prismic-snapshots](https://backplane.wellcome.digital/catalog/component/default/prismic-snapshots) (internal)             | Lambdas `prismic-snapshot`, `prismic-backup-trigger`, `prismic-backup-download` and state machine `prismic-assets-backup` | [infrastructure/prismic-snapshots/](https://github.com/wellcomecollection/content-api/tree/main/infrastructure/prismic-snapshots) |

`{date}` is the live pipeline date. It is `LIVE_PIPELINE` in [.buildkite/pipeline.yml](https://github.com/wellcomecollection/content-api/blob/main/.buildkite/pipeline.yml) and `pipelineDate` in [api/config.ts](https://github.com/wellcomecollection/content-api/blob/main/api/config.ts), and the API reports it at `/_elasticConfig`. The stage API reads the same cluster as prod; there is no stage pipeline.

|                                      |                                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runs in                              | catalogue account, eu-west-1: ECS cluster `content-api`, the Lambdas above, Elastic Cloud deployment `content-{date}`                                                                                      |
| Public URL or entry point            | `https://api.wellcomecollection.org/content/v0` (stage: `https://api-stage.wellcomecollection.org/content/v0`)                                                                                             |
| Users affected if down               | Content results on the main search page, stories and events search, the stories and events listing pages, the latest stories on the homepage and the stories shown on work pages all read from this API    |
| Users affected if the pipeline stops | Nothing breaks, but new and edited content stops appearing in search and listings. Unpublishing does not depend on the pipeline: if unpublished content stays visible, look at the webhook and unpublisher |
| Statuspage component                 | Website & Content                                                                                                                                                                                          |

## How to tell it is broken

The alarm definitions live in the shared Lambda module used by [infrastructure/pipeline_stack](https://github.com/wellcomecollection/content-api/tree/main/infrastructure/pipeline_stack) and [infrastructure/webhook_stack](https://github.com/wellcomecollection/content-api/tree/main/infrastructure/webhook_stack), and in [infrastructure/prismic-snapshots/cloudwatch_alarms.tf](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots/cloudwatch_alarms.tf). All of them post to #wc-platform-alerts, which the [bug nurse](https://github.com/wellcomecollection/developer-handbook/blob/main/incident-management/bug-nurse.md) triages.

| Signal                                                                                                 | Posts to              | What it means                                                                                           | Go to                                                                   |
| ------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `lambda-content-pipeline-{date}-errors`                                                                | #wc-platform-alerts   | A pipeline run failed. Changes made in Prismic during that 15 minute window have not reached the index. | [Pipeline run failed](#pipeline-run-failed)                             |
| `lambda-content-prismic-webhook-errors` or `lambda-content-unpublisher-{date}-errors`                  | #wc-platform-alerts   | An unpublish event from Prismic was not processed, so a deleted document may still show                 | [Unpublished content still showing](#unpublished-content-still-showing) |
| `prismic-snapshot-errors`, `prismic-snapshot-missing-invocations`, `prismic-snapshot-duration-warning` | #wc-platform-alerts   | The nightly Prismic document backup failed, did not run in 24 hours, or took over 12 of its 15 minutes  | [Prismic backup failed](#prismic-backup-failed)                         |
| `prismic-assets-backup-failed`, `prismic-assets-backup-missing-executions`                             | #wc-platform-alerts   | The nightly media library backup failed or did not run in 24 hours                                      | [Prismic backup failed](#prismic-backup-failed)                         |
| "ECS tasks not starting" message for cluster `content-api`                                             | #wc-platform-alerts   | The API cannot start new tasks, usually during a deploy                                                 | [Content API returns errors](#content-api-returns-errors)               |
| LogicMonitor "WC - Homepage" or "WC - Stories" web check failing                                       | #wc-platform-alerts   | Those pages call the Content API, so it may be the cause                                                | [Content API returns errors](#content-api-returns-errors)               |
| Reports from colleagues or the public                                                                  | #wc-platform-feedback | Usually "my edit is not showing in search" or "this deleted page still appears"                         | [First steps](#first-steps)                                             |

The API itself has no CloudWatch alarm on errors or latency, and nothing alarms if the pipeline schedule stops running.

Quick checks anyone can run:

- API answers from Elasticsearch: `curl -s "https://api.wellcomecollection.org/content/v0/articles?pageSize=1"`. The health check at `/management/healthcheck` only shows the container is up; it does not query Elasticsearch.
- Live pipeline date: `curl -s https://api.wellcomecollection.org/content/v0/_elasticConfig`
- Logs: CloudWatch log groups `/aws/lambda/content-pipeline-{date}`, `/aws/lambda/content-prismic-webhook`, `/aws/lambda/content-unpublisher-{date}` and `/aws/lambda/prismic-snapshot`. The first three keep only one day of logs in CloudWatch and forward everything to the logging cluster, so look there for anything older. API logs and APM (service `content-api`, environments `prod` and `stage`) are in the logging cluster's Kibana too (internal).

## First steps

1. **Is it real?** Run the quick checks above. One pipeline error followed by successful runs is often a Prismic or network blip, but re-run the failed window anyway (see below).
2. **Say you are looking.** Reply in the alert thread, or in #wc-incident-response if users are affected.
3. **Did something change?** Look at recent [Buildkite builds](https://buildkite.com/wellcomecollection/content-api) (internal) and [merged PRs](https://github.com/wellcomecollection/content-api/pulls?q=is%3Apr+is%3Amerged). Merges to `main` deploy the pipeline, unpublisher and webhook straight away. Also check for a recent Prismic model change in [wellcomecollection.org](https://github.com/wellcomecollection/wellcomecollection.org/tree/main/prismic-model). If a deploy lines up with the start of the problem, roll back first and investigate after (see [Rollback](#rollback)).
4. **Is a dependency down?** Check the status pages in [Dependencies](#dependencies-and-supplier-escalation).
5. **Get access.** Start with the `catalogue-read_only` role; the how-to is in [aws-account-infrastructure/docs/how-to](https://github.com/wellcomecollection/aws-account-infrastructure/tree/main/docs/how-to) (internal). Invoking Lambdas, retagging images and redeploying need `catalogue-developer`; use it only for the fix itself.
6. **Is it major?** If stories or events search and listings are failing for users and a fix is not in sight, follow the [major incident playbook](https://github.com/wellcomecollection/developer-handbook/blob/main/incident-management/incident-comms-and-escalation.md).

## Common failures and fixes

### Pipeline run failed

- **Symptom:** `lambda-content-pipeline-{date}-errors` in #wc-platform-alerts.
- **Confirm:** read the failed run's log: `AWS_PROFILE=catalogue-read_only aws logs tail /aws/lambda/content-pipeline-{date} --since 1h`. Check whether the runs after it succeeded.
- **Cause:** two causes have been seen so far. A new dated pipeline was invoked before its code was deployed (`Runtime.HandlerNotFound`), and a graph query stopped matching the Prismic model after a model change (see the next section). A Prismic or Elastic Cloud outage would also do it.
- **Fix:** fix the cause, then re-run the window that failed. Each scheduled run looks back only 16 minutes, so later runs do not cover a failed window. The daily addressables run reloads addressables but not articles, events or venues. Re-running a window is safe, so do it unless you are sure a retry of the same run succeeded. Invoke the pipeline with an explicit start and end that cover the failure:

  ```bash
  AWS_PROFILE=catalogue-developer aws lambda invoke \
    --function-name content-pipeline-{date} \
    --cli-binary-format raw-in-base64-out \
    --payload '{"contentType":"all","start":"2026-11-13T09:00:00Z","end":"2026-11-13T10:00:00Z"}' \
    /dev/stdout
  ```

  The Lambda times out after 10 minutes. For a long gap, reindex one content type at a time from `pipeline/` on your machine instead, for example `AWS_PROFILE=catalogue-developer yarn reindex-articles` (also `reindex-events`, `reindex-addressables` and `reindex-venues`, as in the [pipeline README](https://github.com/wellcomecollection/content-api/blob/main/pipeline/README.md#how-to-reindex)).

- **Watch out:** the local reindex writes to the live index, and the pipeline date is hard-coded in `pipeline/src/local.ts`; check it matches `/_elasticConfig` before running.
- **Seen in:** content-pipeline `HandlerNotFound` alert on 2026-10-13, [Slack thread](https://wellcome.slack.com/archives/CQ720BG02/p1791897851877859) (internal)

### Pipeline breaks after a Prismic model change

- **Symptom:** pipeline errors starting just after a Prismic custom type or slice change was published, usually for one content type.
- **Confirm:** the log shows a Prismic graph query error or a transformer failing on a missing field.
- **Cause:** the graph queries in [pipeline/src/graph-queries](https://github.com/wellcomecollection/content-api/tree/main/pipeline/src/graph-queries) name Prismic fields directly, so renaming or restructuring a field in the model breaks them.
- **Fix:** change the graph query and transformer to match the new model, merge (the pipeline deploys on merge), then reindex the affected content type so documents edited in the meantime are picked up.
- **Watch out:** the content API keeps serving the last good index, so users see stale rather than broken content. The website reads Prismic directly for most pages and may need its own fix.
- **Seen in:** [2024-05-13 Prismic Slice Machine migration](https://github.com/wellcomecollection/docs/blob/main/incident_retros/2024-05-13_prismic_slice_machine_migration.md)

### Unpublished content still showing

- **Symptom:** a document unpublished in Prismic still appears in stories or events search; or one of the webhook or unpublisher error alarms fired.
- **Confirm:** look in `/aws/lambda/content-prismic-webhook` and `/aws/lambda/content-unpublisher-{date}` around the time of the unpublish. No webhook invocation at all points at the webhook configuration in Prismic. The webhook logs a `Response:` line with the status for every request: 400 means a bad payload or a missing or wrong `x-weco-prismic-trigger` header, and 401 or 403 means a missing or wrong secret. If you see one of those, compare the Prismic webhook settings with the [webhook README](https://github.com/wellcomecollection/content-api/blob/main/webhook/README.md).
- **Cause:** the webhook rejected the event, EventBridge did not deliver it, or the unpublisher could not reach Elasticsearch.
- **Fix:** remove the document by hand by invoking the unpublisher with the Prismic document id (not yet tried in an incident; the handler reads only `detail.documents`):

  ```bash
  AWS_PROFILE=catalogue-developer aws lambda invoke \
    --function-name content-unpublisher-{date} \
    --cli-binary-format raw-in-base64-out \
    --payload '{"detail-type":"document-unpublish","detail":{"documents":["PRISMIC_DOCUMENT_ID"]}}' \
    /dev/stdout
  ```

  If the webhook itself is misconfigured, set it up again as described in the [webhook README](https://github.com/wellcomecollection/content-api/blob/main/webhook/README.md). Prismic webhooks can only be configured in the Prismic dashboard.

- **Watch out:** this deletes from the live index straight away. If you remove a document that is still published, the next edit to it or a reindex brings it back.
- **Seen in:** no recorded incident.

### Content API returns errors

- **Symptom:** website listing or search pages for stories or events failing, LogicMonitor Homepage or Stories checks failing, or the quick check above returning an error.
- **Confirm:** `curl -s -o /dev/null -w '%{http_code}\n' "https://api.wellcomecollection.org/content/v0/articles?pageSize=1"`. Then check the ECS service: `AWS_PROFILE=catalogue-read_only aws ecs describe-services --cluster content-api --services content-api-prod --query 'services[0].[runningCount,desiredCount,deployments[0].rolloutState]'`.
- **Cause:** a bad deploy, tasks failing to start, or the Elastic Cloud cluster being unavailable.
- **Fix:** if a deploy lines up, roll back (see [Rollback](#rollback)). If the tasks are running but queries fail, check the Elastic Cloud deployment `content-{date}` and the Elastic status page. The prod service runs a single task, so a stuck task means a full outage; forcing a new deployment replaces it: `CLUSTER=content-api ./builds/deploy_ecs_services.sh content-api-prod` with `catalogue-developer`.
- **Watch out:** the stage API reads the same Elasticsearch cluster as prod, so a cluster problem shows on both.
- **Seen in:** no recorded incident.

### Prismic backup failed

- **Symptom:** one of the `prismic-snapshot-*` or `prismic-assets-backup-*` alarms.
- **Confirm:** list the latest snapshots: `AWS_PROFILE=catalogue-read_only aws s3 ls s3://wellcomecollection-prismic-backups/snapshots/ | sort | tail -3`. The keys start with the Prismic ref, so sort on the listing's date and time columns. For the media backup, look at the latest execution of the `prismic-assets-backup` state machine in the Step Functions console.
- **Cause:** not yet recorded. A Prismic outage would do it; check the status page.
- **Fix:** no user impact, so this can wait for working hours. Fix the cause, then run the backup by hand. For documents, invoke `prismic-snapshot` as in the [Prismic snapshots README](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots/README.md#manual-lambda-invocationsnapshot-creation). For media, start a new execution of the `prismic-assets-backup` state machine with input `{}` (see [Manual Step Functions Execution](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots/README.md#manual-step-functions-execution)). Everything is in the catalogue account, so use `catalogue-developer` even where the README says `experience-developer`.
- **Watch out:** document snapshots are kept for 14 days, so a backup failure lasting longer than that leaves no recent copy for the [Prismic disaster recovery runbook](https://github.com/wellcomecollection/wellcomecollection.org/blob/main/prismic-model/prismic_disaster_recovery_full.md).
- **Seen in:** no recorded incident.

## Rollback

Follow the general [rollback guide](https://github.com/wellcomecollection/developer-handbook/blob/main/developer-handbook/rollback.md) first. The [change model](https://github.com/wellcomecollection/developer-handbook/blob/main/developer-handbook/change-model.md) says which kinds of change need which route. For this service:

- **How it deploys:** a merge to `main` runs the [content-api Buildkite pipeline](https://buildkite.com/wellcomecollection/content-api) (internal). It publishes an image tagged `ref.{commit}` and Lambda packages, deploys the live pipeline, unpublisher and webhook Lambdas immediately, deploys the API to stage, runs the website end-to-end tests against the stage APIs (failures do not block), then waits at a "deploy to prod" block step before deploying the API to prod. The Prismic backup Lambdas are not deployed by CI; they are deployed from a laptop with `infrastructure/prismic-snapshots/scripts/deploy-code.sh`.
- **To roll back a code change:** revert the PR and let the pipeline redeploy, unblocking the prod step for API changes. To roll back the API faster, point `env.prod` at the previous image and redeploy, using `catalogue-developer`:

  ```bash
  export AWS_PROFILE=catalogue-developer
  # find the previous image's ref.{commit} tag
  aws ecr describe-images --repository-name weco/content-api \
    --query 'reverse(sort_by(imageDetails,&imagePushedAt))[:5].[imageTags,imagePushedAt]'
  MANIFEST=$(aws ecr batch-get-image --repository-name weco/content-api \
    --image-ids imageTag="ref.PREVIOUS_COMMIT_SHA" --query 'images[0].imageManifest' --output text)
  aws ecr put-image --repository-name weco/content-api --image-tag env.prod --image-manifest "$MANIFEST"
  CLUSTER=content-api ./builds/deploy_ecs_services.sh content-api-prod
  ```

  For the pipeline, unpublisher or webhook, redeploy the previous package: `AWS_PROFILE=catalogue-developer .buildkite/scripts/deploy_lambda.sh content-pipeline-{date} ref.PREVIOUS_COMMIT_SHA`. Packages are kept for 30 days and images for the last 100 builds; past that, revert and rebuild.

- **Cannot be rolled back this way:**
  - A pipeline date flip. Going back means pointing `LIVE_PIPELINE` and `pipelineDate` at the old date, which only works while the old pipeline and cluster still exist. The steps for creating and deleting pipelines are in [infrastructure/README.md](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/README.md).
  - Terraform changes in `infrastructure/`, which are applied from a laptop. Roll forward with another reviewed apply.
  - Prismic model changes, which live in [wellcomecollection.org/prismic-model](https://github.com/wellcomecollection/wellcomecollection.org/tree/main/prismic-model). Fix the graph query here instead (see above).
  - Documents already deleted from the index by the unpublisher. If a document should come back, republish it in Prismic first, then reindex its content type or re-run the pipeline for a window covering its last publication. The pipeline selects documents by last publication date, so replaying the period of the deletion misses them.
- **Check it worked:** the quick checks pass, and `aws ecs describe-services --cluster content-api --services content-api-prod --query 'services[0].deployments[0].rolloutState'` shows `COMPLETED`. For a Lambda, `aws lambda get-function-configuration --function-name content-pipeline-{date} --query LastModified` shows the time of your redeploy.

## Dependencies and supplier escalation

Suppliers who build or run part of this service are listed as vendors on the [Backplane entity](https://backplane.wellcome.digital/catalog/system/default/content-api) (internal). Their support contacts, contract terms and severity definitions are in [suppliers.md](https://github.com/wellcomecollection/private/blob/main/suppliers.md) (private). The escalation routes by role are in the [major incident playbook](https://github.com/wellcomecollection/developer-handbook/blob/main/incident-management/incident-comms-and-escalation.md).

| Dependency                                               | What breaks if it is down                                                        | How to check it                                                                                                   | Who escalates, and how                            |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Prismic                                                  | The pipeline and backups fail; the API keeps serving the last indexed content    | [status.prismic.io](https://status.prismic.io)                                                                    | As in the major incident playbook                 |
| Elastic Cloud                                            | The API returns errors and the pipeline fails                                    | [status.elastic.co](https://status.elastic.co)                                                                    | Support ticket, as in the major incident playbook |
| AWS (ECS, API Gateway, Lambda, EventBridge in eu-west-1) | Any part                                                                         | [AWS Health Dashboard](https://health.aws.amazon.com/health/status)                                               | As in the major incident playbook                 |
| api.wellcomecollection.org CloudFront distribution       | The API is unreachable from outside                                              | Other APIs on the same hostname failing too                                                                       | Digital Platform, via its Backplane team page     |
| wellcomecollection.org                                   | Nothing here. It consumes this API, and its runbook covers the pages that use it | [Website runbook](https://github.com/wellcomecollection/wellcomecollection.org/blob/main/content/docs/runbook.md) | Owning team, via its Backplane team page          |

## Related links

- Architecture page: [docs/architecture/services/apis/content_api.md](https://github.com/wellcomecollection/docs/blob/main/architecture/services/apis/content_api.md)
- [Pipeline README](https://github.com/wellcomecollection/content-api/blob/main/pipeline/README.md), including how linked documents are kept up to date and how to reindex
- [Pipeline management](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/README.md): creating and deleting dated pipelines
- [Webhook README](https://github.com/wellcomecollection/content-api/blob/main/webhook/README.md): configuring the Prismic unpublish webhook
- [Prismic snapshots README](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots/README.md) and the [Prismic disaster recovery runbook](https://github.com/wellcomecollection/wellcomecollection.org/blob/main/prismic-model/prismic_disaster_recovery_full.md)
- Retro: [2024-05-13 Prismic Slice Machine migration](https://github.com/wellcomecollection/docs/blob/main/incident_retros/2024-05-13_prismic_slice_machine_migration.md)
