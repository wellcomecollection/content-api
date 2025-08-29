# Content API Development Guide

Always follow these instructions first. Only fallback to additional search or bash commands when the information here is incomplete or found to be incorrect.

## Working Effectively

This is a Node.js/TypeScript monorepo with 4 services that back the [Wellcome Collection Content API](https://developers.wellcomecollection.org/api/content): **API** (Express server), **Pipeline** (ETL from Prismic to Elasticsearch), **Webhook** (Lambda for Prismic events), and **Unpublisher** (removes content from ES index).

### Bootstrap and Install Dependencies

- **ALWAYS** use Node.js v20.15.0 (from `.nvmrc`)
- Install dependencies: `yarn install --frozen-lockfile` -- takes 45 seconds. NEVER CANCEL.
- **CRITICAL**: Husky will automatically set up pre-commit hooks that run `yarn lint-staged` (auto-formatting)

### Build and Test

- Type check all services: `yarn tsc` -- takes 17 seconds. NEVER CANCEL.
- Lint code: `yarn lint` -- takes 5 seconds. **NOTE**: Currently has 2 linting errors in pipeline transformers (unused `worksIds` variables) - this is expected.
- Run all tests:
  - API tests: `cd api && yarn test` -- takes 17 seconds. NEVER CANCEL.
  - Pipeline tests: `cd pipeline && yarn test` -- takes 14 seconds. NEVER CANCEL.
  - Webhook tests: `cd webhook && yarn test` -- takes 5 seconds. NEVER CANCEL.
  - Unpublisher tests: `cd unpublisher && yarn test` -- takes 5 seconds. NEVER CANCEL.

### Local Development

- **API development**: `cd api && AWS_PROFILE=catalogue-developer yarn dev`
  - Runs on http://localhost:3002
  - **REQUIRES AWS credentials** - without them, will start but log AWS region errors
  - Uses Elasticsearch cluster and requires AWS Secrets Manager access
- **Lambda packaging** (for pipeline/webhook/unpublisher): `yarn run package` -- takes 1 second each
- **Docker development**: Use `docker compose` (v2) commands. Build may fail due to network/firewall issues.
  - Test with Docker: `docker compose run api yarn test` (if network allows)
  - **NOTE**: `docker-compose` (v1) is not available, use `docker compose` (v2)

### Validation Requirements

- **ALWAYS** run `yarn lint` and `yarn tsc` before committing changes
- **ALWAYS** run relevant service tests after making changes
- **CRITICAL**: Set timeout values of 60+ minutes for any build commands and 30+ minutes for test commands
- **MANUAL VALIDATION**: After making API changes, test actual functionality by running `yarn dev` and hitting endpoints

## Architecture Overview

```
Prismic API → Pipeline (Lambda) → Content Cluster (ES) → API (ECS) → wellcomecollection.org
     ↓
Prismic webhook → Webhook (Lambda) → Unpublisher (Lambda) → Content Cluster (ES)
```

### Key Services

- **`/api`**: Express.js API server (runs on ECS, queries Elasticsearch)
- **`/pipeline`**: ETL Lambda (scheduled, transforms Prismic content to ES documents)
- **`/webhook`**: Lambda handler (receives Prismic webhook events, publishes to EventBridge)
- **`/unpublisher`**: Lambda (removes documents from ES index based on webhook events)
- **`/common`**: Shared TypeScript code and services (logging, ES client, AWS services)

### Important Files and Directories

- **`api/src/controllers/`**: API endpoint handlers for articles, events, venues, addressables
- **`pipeline/src/transformers/`**: Data transformation logic from Prismic to ES format
- **`common/services/`**: Shared services (elasticsearch.ts, aws.ts, logging.ts, init-apm.ts)
- **`infrastructure/`**: Terraform configurations and deployment scripts
- **`.buildkite/pipeline.yml`**: CI/CD pipeline configuration (uses Docker Compose for testing)

## CI/CD and Deployment

- **All deployment is done in CI** via Buildkite pipeline (`.buildkite/pipeline.yml`)
- **Live pipeline date**: Currently `2025-07-30` (check `LIVE_PIPELINE` in `.buildkite/pipeline.yml`)
- **Auto-formatting**: Pre-commit hooks run Prettier and lint-staged automatically
- **Docker**: Uses multi-stage builds, all services use Node.js v20 base image
- **AWS**: Deploys to ECS (API) and Lambda (pipeline/webhook/unpublisher)

### Pipeline Deployment Process

1. **Tests run in parallel** using Docker Compose (API, pipeline, webhook, unpublisher)
2. **API**: Builds Docker image and pushes to ECR
3. **Lambdas**: Packages with esbuild and uploads to S3
4. **Staging deploy**: Updates ECS services and Lambda functions
5. **Manual approval required** for production deployment

## Common Development Tasks

### Adding New API Endpoints

1. Add controller in `api/src/controllers/`
2. Add route in `api/src/app.ts`
3. Add tests in `api/test/`
4. Update types in `api/src/types/` if needed
5. **ALWAYS** test manually by running `yarn dev` and hitting the endpoint

### Modifying Pipeline Transformers

1. Edit transformers in `pipeline/src/transformers/`
2. Update tests in `pipeline/test/transformers/`
3. Run `yarn test` to validate snapshots
4. Use `yarn jest --updateSnapshot` if snapshot changes are expected
5. **Check**: Update corresponding code in `api/src/` if response format changes

### Infrastructure Changes

1. Modify Terraform files in `infrastructure/`
2. **NEW PIPELINES**: Use `./infrastructure/create_pipeline.sh <DATE>` script
3. **Terraform**: Use `./infrastructure/run_terraform.sh plan|apply` with proper AWS credentials
4. **CRITICAL**: Infrastructure changes take 20+ minutes. NEVER CANCEL.

## Validation Scenarios

After making changes, **ALWAYS** test these scenarios:

### API Changes

1. Start API with `cd api && yarn dev`
2. Test health endpoint: `curl http://localhost:3002/management/healthcheck`
3. Test data endpoints: `curl http://localhost:3002/articles` or `curl http://localhost:3002/events`
4. **Expected**: Without AWS credentials, will return error responses but server should stay running
5. Verify response structure matches expected format and HTTP status codes

### Pipeline Changes

1. Run transformer tests: `cd pipeline && yarn test`
2. Test specific transformer: `yarn run testTransformer`
3. Validate with real data if possible: `yarn run reindex-articles` (requires AWS)

### Common Validation Failures

- **Linting errors**: Fix with `yarn lint --fix` or manually address the 2 known issues
- **Type errors**: Run `yarn tsc` to identify and fix
- **Test snapshots**: Update with `yarn jest --updateSnapshot` if intentional changes
- **AWS errors**: Expected in local development without proper credentials

## Troubleshooting

### Known Issues

- **Docker build failures**: Network/firewall issues prevent downloading dependencies
- **AWS credential errors**: Normal when running locally without `AWS_PROFILE=catalogue-developer`
- **2 linting errors**: Unused `worksIds` variables in `pipeline/src/transformers/addressables/` - expected
- **Self-signed certificate errors**: Network restrictions in containerized environments

### Performance Expectations

- **Dependencies install**: ~45 seconds
- **TypeScript compilation**: ~17 seconds
- **Test suites**: 5-17 seconds per service
- **Lambda packaging**: ~1 second per service
- **Infrastructure deployments**: 20+ minutes

### Emergency Procedures

- **Revert changes**: Use `git checkout <file>` for individual files
- **Force deployment**: Requires manual pipeline triggering in Buildkite
- **Pipeline issues**: Check `infrastructure/README.md` for pipeline management

**CRITICAL REMINDER**: NEVER CANCEL long-running builds or tests. Always wait for completion and set appropriate timeouts (60+ minutes for builds, 30+ minutes for tests).
