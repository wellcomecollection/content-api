# Content API Coding Standards

These guidelines are read by all Copilot surfaces (IDE agent, PR reviewer, cloud agent). For agent-specific operational guidelines (build commands, working style, repo structure), see [AGENTS.md](../AGENTS.md).

Use British English spelling throughout everything that is not code.

## Duplication and Code Reuse

Before creating new utilities, helpers, or services:

1. Search `common/services/` and `common/types/` for existing implementations
2. Check `api/src/queries/` and `api/src/controllers/` for similar logic already handled elsewhere
3. If you find duplication, refactor to use the shared implementation instead of creating a new one
4. When removing dependencies, clean up unused imports and delete obsolete files

## Prismic Conventions

<!-- https://app.gitbook.com/o/-LumfFcEMKx4gYXKAZTQ/s/451yLOIRTl5YiAJ88yIL/api-id-name-casing#future-api-id-naming -->

As the Prismic repository has evolved, custom types, slices, and their fields have ended up with inconsistent naming — some kebab-case, some camelCase, some snake_case. An RFC settled how we want to approach naming going forward; we agreed not to rename existing API IDs, since the effort and risk of a migration wasn't worth it.

### Future API ID naming

- Custom type IDs should be kebab-case. Plural for repeatable types (e.g. `exhibition-highlight-tours`) and singular for singleton types (e.g. `global-alert`). This involves overriding the default snake_case ids that Prismic will suggest
- Field IDs for all custom types and slices should be camelCase (e.g. `datePublished`). This involves overriding the default snake_case ids that Prismic will suggest
- Slice IDs should be snake_case (e.g. `guide_section_heading`) — this is the default from Prismic and can't be overridden in the UI

## PR Review Guidelines

When reviewing, check changes against the coding standards above (duplication, Prismic conventions).

### TODOs and Technical Debt

When you see new TODOs being added, ask whether this is the right time to add it or if it should be addressed in the current PR.

For existing TODOs in the code being changed, check whether they are still relevant. If a TODO is clearly obsolete or the work has already been completed, suggest removing or updating it; otherwise, leave it in place, but note any apparent staleness to the author.

### Dead Code

When a PR replaces or removes a feature, check that the old implementation actually goes with it — unused exports, functions, files, config, or feature flags left behind after a change. Flag anything that's no longer referenced anywhere instead of leaving it to rot.

### Documentation

When reviewing, check whether documentation needs updating:

- READMEs affected by new features, changed commands, or modified setup steps
- Code comments that might be outdated by the changes
- The OpenAPI spec generator (`api/scripts/documentation/generate-openapi.ts`) if endpoints or response schemas change
- The AGENTS.md and copilot-instructions.md files if the changes affect coding standards or instructions for Copilot

If the PR changes behaviour or adds features but doesn't update relevant docs, flag it.
