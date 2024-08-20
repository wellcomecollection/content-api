# Content ETL pipeline

This service extracts documents from Prismic, transforms them into a common schema, and indexes them into Elasticsearch.

It runs as a Lambda which is invoked every 15 minutes by an EventBridge schedule. The payload looks like this:

```json
{
  "contentType": "all", // can also be any of "articles", "events" or "venues"
  "duration": "16 minutes",
  "end": "<aws.scheduler.scheduled-time>" // time when the schedule runs
}
```

The ETL pipeline(s) can also be triggered manually by running _`yarn reindex`, `yarn reindex-articles`_, _`yarn reindex-events`_ or _`yarn reindex-venues`_ in the `/pipeline` directory. You'll need to be logged in to AWS and prepend the command with _`AWS_PROFILE=catalogue-developer`_.  
⚠️ This will affect data used in production

Depending on the `contentType` in the trigger the handler instantiates the required pipeline(s).  
We use [RxJS](https://rxjs.dev/) to facilitate the streaming of data.

## Extract

We fetch all the Prismic documents that were updated within the window event, and partition the results as either "parent documents" (ie. of the type that we want to index) or "other documents" (ie. any other updated document, that may or may not have been denormalised unto a "parent document). See [How we handle nested content](#how-we-handle-nested-content).  
Once we have all the Prismic documents that were updated directly, or via one of their linked documents, we pass them to the `transformer`.

#### How we handle nested content

We use Prismic's graph query API to denormalise nested content onto articles or events: for example, although contributors are separate documents which articles are linked to, when we fetch an article we instruct Prismic to grab the contributors' names off those linked documents for us and to insert them into the article response.

This is extremely useful, but it presents us with an issue: if a contributor or other linked document is modified, how do we know to update all the articles or other parent documents that reference it?

Our solution is to:

1. Store all of the `linkedIdentifiers` of a parent document alongside it in the index. For example, this would be the identifiers of the contributors for a given article.
2. When _any_ document is updated, we query for anything that includes its identifier in those `linkedIdentifiers`.
3. If we find anything, we re-fetch that document too (we don't worry about applying the update we've received to already-indexed documents, we just fetch them again).

Each `contentType`'s graph query can be found in `/src/graph-queries`

## Transform

Transformers take their respective PrismicDocument type (see `/src/types/prismic`) and transform it into an Elasticsearch type (see `/src/types/transformed` and `/common/types`), ready to be indexed. The `linkedIdentifiers` mentioned above are also added by this point.

The Elasticsearch types mirror the indice mappings found in `/src/indices` which forms a contract between the pipeline and the API.

## Load

[Elastic client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-helpers.html) provides a handy bulk helper that gracefully handles indexing success and failure.

## Tests

The transformers are tested using snapshots of real Prismic data, compared against [Jest snapshots](https://jestjs.io/docs/snapshot-testing) of the expected output.  
The Prismic snapshots are created by adding Prismic document IDs to `tests/update-prismic-snapshots.ts`, then running _`yarn update-prismic-snapshots`_.  
They are updated by using the same command. The comments next to each ID, containing the document titles, are automatically added when the script is run.

To update the Jest snapshots, you'll need to run `yarn jest --updateSnapshot`.

## How to reindex

First, ensure it's safe to do so as it will affect data used in production. Then you'll need to be logged in and specify the role in the command line.

For example:
`AWS_PROFILE=catalogue-developer yarn reindex-events`
