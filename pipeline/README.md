# Content ETL pipeline

This service extracts documents from Prismic, transforms them into a common schema, and indexes them into Elasticsearch.

It runs as a Lambda which expects events that look like:

```typescript
type WindowEvent = {
  contentType: 'addressables' | 'articles' | 'events' | 'venues' | 'all';
  start?: string;
  end?: string;
  duration?: string;
};

type BackupEvent = {
  operation: 'backup';
};
```

For indexing operations, it will fetch documents between a given start and end, or for a duration before/after an end/start (respectively), or all documents if none of these parameters are specified.

For backup operations, it will fetch ALL Prismic document types and save them to S3 with ISO8601 timestamps.

![generic-ETL](https://github.com/user-attachments/assets/ed1f6fd7-4111-4829-9f51-802fc77b742f)

## Backup Functionality

The pipeline includes a daily backup feature that saves all Prismic content types to S3:

- **Document Types**: Backs up all 12 content types: articles, books, events, exhibitions, exhibition-texts, exhibition-highlight-tours, pages, projects, seasons, visual-stories, webcomics, collection-venue
- **Storage**: Raw Prismic documents saved to S3 with path format: `backups/YYYY-MM-DDTHH:mm:ss.sssZ/content-type.json`
- **Schedule**: Runs daily via AWS EventBridge scheduler
- **Infrastructure**: Dedicated S3 bucket with versioning and 90-day lifecycle policy
- **Local Testing**: Use `npm run backup` to test backup functionality locally

### Backup Testing

To run backup locally:
```bash
npm run backup
```

Note: Local testing requires proper AWS credentials and BACKUP_BUCKET_NAME environment variable.

## Tests

The tests use snapshots of real Prismic data, and also save [Jest snapshots](https://jestjs.io/docs/snapshot-testing) of the expected output.

If you want to update the Prismic data that's in the repo, run _`yarn update-prismic-snapshots`_. The list of document IDs to store lives in `tests/update-prismic-snapshots.ts`. The comments next to each ID, containing the document titles, are automatically added when the script is run.

To update the Jest snapshots, you'll need to run `yarn jest --updateSnapshot`.

## How we handle nested content

We use Prismic's graph query API to denormalise nested content onto articles: for example, although contributors are separate documents which articles are linked to, when we fetch an article we instruct Prismic to grab the contributors' names off those linked documents for us and to insert them into the article response.

This is extremely useful, but it presents us with an issue: if a contributor or other linked document is modified, how do we know to update all the articles or other parent documents that reference it?

Our solution is to:

1. Store all of the `linkedIdentifiers` of a parent document alongside it in the index. For example, this would be the identifiers of the contributors for a given article.
2. When _any_ document is updated, we query for anything that includes its identifier in those `linkedIdentifiers`.
3. If we find anything, we re-fetch that document too (we don't worry about applying the update we've received to already-indexed documents, we just fetch them again).

## How to reindex

First, ensure it's safe to do so as it will affect data used in production. Then you'll need to be logged in and specify the role in the command line.

For example:
`AWS_PROFILE=catalogue-developer yarn reindex-events`
