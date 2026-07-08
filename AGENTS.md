# Content API – Agent Guidelines

Guidelines for AI assistants working on this codebase. Read this before implementing anything.

## Working Style

**Ask before assuming.** If requirements are unclear, the approach is ambiguous, or there are multiple reasonable solutions, ask rather than guessing.

**Complete work properly.** Before considering a task done:

- Fix all linting errors (`yarn lint` from the root)
- Run `yarn tsc` from the root to check TypeScript across all packages
- Run `yarn test` inside the relevant service directory (e.g. `cd api && yarn test`)
- Check that new imports follow the import rules (see below)

Write casually. No emojis or excessive bold in responses.

## Repo Structure

This is a Yarn workspaces monorepo. The main packages are:

| Directory         | Purpose                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `api/`            | Express API served to external consumers. Query params validated with Zod, responses from Elasticsearch. |
| `pipeline/`       | Scheduled Lambda. Fetches content from Prismic, transforms it, indexes into Elasticsearch.               |
| `webhook/`        | Lambda function URL. Receives Prismic webhooks, publishes events to EventBridge.                         |
| `unpublisher/`    | Lambda. Consumes EventBridge events, removes documents from Elasticsearch.                               |
| `common/`         | Shared types, services (Elasticsearch client, logging, AWS), and data constants.                         |
| `infrastructure/` | Terraform. Do not modify unless specifically asked.                                                      |

## Build and Test

```bash
# From the root
yarn install
yarn tsc          # TypeScript check across all packages

# Per service
cd api && yarn test
cd pipeline && yarn test
cd webhook && yarn test
cd unpublisher && yarn test

# Run the API locally (needs AWS auth)
AWS_PROFILE=catalogue-developer yarn dev   # from api/
```

To update Jest snapshots:

```bash
cd api && yarn jest --updateSnapshot
```

## Import Rules

**No relative imports that cross a directory boundary.** You can only use `./` relative imports within the same directory. Any import that would require `../` must use the `@weco/` package alias instead — including imports from `common/`, which is a first-class workspace package:

```typescript
// ✅ correct — alias for cross-directory imports, including common/
import { something } from '@weco/content-api/src/helpers';
import { Clients } from '@weco/content-api/src/types';
import { logStream } from '@weco/content-common/services/logging';
import { defaultValues } from '@weco/content-common/data/defaultValues';

// ❌ wrong — ../ is blocked regardless of target
import { something } from '../helpers';
import { logStream } from '../../common/services/logging';
```

Imports within a file must be ordered: built-ins → external packages → `@weco/*` → local siblings. ESLint enforces this automatically.

**Scripts in `api/scripts/`** follow the same rule — use `@weco/content-api/src/...` for anything outside the scripts directory.

## Validation and Zod Schemas

Query parameter validation in `api/` is done with Zod schemas, not raw Express types.

- Each list endpoint has a `*QuerySchema` exported from its controller (e.g. `ArticlesQuerySchema`, `EventsQuerySchema`)
- Shared helpers (`commaSeparatedEnum`, `commaSeparatedPrismicIds`, `dateStringSchema`, `queryStringSchema`, `workIdsSchema`, `PaginationQuerySchema`) live in `api/src/controllers/validation.ts`
- `ZodError` is caught and converted to the standard `ErrorResponse` JSON shape in `api/src/controllers/error.ts` — do not add separate error handling in controllers
- When adding a new query parameter, add it to the Zod schema with a `.meta({ description: '...' })` annotation. The OpenAPI generator imports the schema directly, so the parameter appears in the spec automatically. Only touch `api/scripts/generate-openapi.ts` if you're changing response schemas.

## OpenAPI Spec Generation

The Content API spec is auto-generated and synced to `wellcomecollection/developers.wellcomecollection.org`.

- Generator: `api/scripts/generate-openapi.ts`
- Run it: `npx tsx api/scripts/generate-openapi.ts` (outputs YAML to stdout)
- Sync workflow: `.github/workflows/sync-openapi-spec.yml` — triggers on push to `main` when `api/**` changes
- **Do not manually edit `reference/content.yaml`** in the developers repo — it is overwritten by the generator

When adding or changing an endpoint, update the generator script to match.

## Elasticsearch

Controllers query Elasticsearch directly via the client in `common/services/elasticsearch.ts`. Each service has its own index (configured in `api/config.ts`). Do not add raw ES queries outside of `api/src/queries/`.

The `Displayable` type represents documents stored in the ES index — they have a `display` field containing the API response shape and a `query` field used for filtering.

## Error Handling

The API uses a single `HttpError` class (`api/src/controllers/error.ts`). Throw it for all expected 4xx errors:

```typescript
throw new HttpError({ status: 400, label: 'Bad Request', description: '...' });
```

`ZodError` from query validation is caught by `errorHandler` and returns the same JSON shape. Do not catch `ZodError` yourself in controllers.

5xx errors are logged and captured in APM automatically via the else branch of `errorHandler`.

## Pull Requests

A good PR description covers:

- **What does this change?** — the problem and how it's solved
- **How to test** — concrete steps (e.g. "hit `/articles?sort=foo` and expect a 400")
- **Risks** — anything that could affect the pipeline, Elasticsearch index, or downstream consumers

Breaking changes to the API response shape must be coordinated with the front-end team (`@wellcomecollection/digital-experience`) since they consume this API directly.
