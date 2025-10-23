# Content API

These are the services that back our [Content API](https://developers.wellcomecollection.org/api/content). The Content API exposes our non-catalogue content. There are endpoints for `articles`, `events`, and `all`, where `all` includes articles, books, events, exhibitions, exhibition texts, exhibition highlight tours (BSL), exhibition highlight tours (audio), pages, projects, seasons, and visual stories.

![Architecture diagram](https://github.com/wellcomecollection/content-api/assets/4429247/b29a6bf5-f5af-426c-b827-550b84c5541c)

## Services

- `/pipeline`: runs on a schedule, queries for updated content, transforms it and puts it into an index in the content ES cluster.
- `/api`: queries the Elasticsearch index
- `/webhook`: a Lambda handler exposed via a function URL for handling Prismic webhook events and publishing them to a EventBridge bus
- `/unpublisher`: receives events published by the webhook, extracts document IDs from them and removes them from the ES index.

## Developing

- Deployment is all done in CI, see `.buildkite/pipeline.yml`
- `husky` will set up a pre-commit hook for autoformatting when you first install dependencies
