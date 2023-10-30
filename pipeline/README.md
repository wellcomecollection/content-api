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

## How we handle nested content

We use Prismic's graph query API to denormalise nested content onto articles: for example, although contributors are separate documents which articles are linked to, when we fetch an article we instruct Prismic to grab the contributors' names off those linked documents for us and to insert them into the article response.

This is extremely useful, but it presents us with an issue: if a contributor or other linked document is modified, how do we know to update all the articles or other parent documents that reference it?

Our solution is to:

1. Store all of the `linkedIdentifiers` of a parent document alongside it in the index. For example, this would be the identifiers of the contributors for a given article.
2. When _any_ document is updated, we query for anything that includes its identifier in those `linkedIdentifiers`.
3. If we find anything, we re-fetch that document too (we don't worry about applying the update we've received to already-indexed documents, we just fetch them again).
