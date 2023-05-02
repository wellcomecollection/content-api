# Content ETL pipeline

This service extracts documents from Prismic, transforms them into a common schema, and indexes them into Elasticsearch.

It runs as a Lambda which expects events that look like:

```typescript
type Event = {
  start?: string;
  end?: string;
  duration?: string;
};
```

It will then fetch documents between a given start and end, or for a duration before/after an end/start (respectively), or all documents if none of these parameters are specified.

## Tests

The tests use snapshots of real Prismic data, and also save [Jest snapshots](https://jestjs.io/docs/snapshot-testing) of the expected output.

If you want to update the Prismic data that's in the repo, run _`yarn update-prismic-snapshots`_. The list of document IDs to store lives in `tests/update-prismic-snapshots.ts`. The comments next to each ID, containing the document titles, are automatically added when the script is run.
