# Content API

The content API is a server running in ECS.
Its exposes endpoints for articles, events and venues.
As of August 2024, the clients are wellcomecollection.org (articles and events) and the catalogue-api (venues)

Staging base URL: `https://api-stage.wellcomecollection.org/content/v0`
Production base URL: `https://api.wellcomecollection.org/content/v0`

### Single documents controllers

Articles and events can be requested by id.
`/articles/:id`
`/events/:id`
This run a simple get query on the index, that returns the `display` object of the matching document or `404` if there is no document by that id in the index.

### "Search" controllers

The "search" controllers take optional query string and params:

- the query string will be used in a [multi_match](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html) ES query
- the `aggregations` params will prompt the API to respond with lists of every unique value for each of the aggregations, along with the number of matching documents
- the `filter` params will be used as `post_filter` if they have a matching aggregations, or as a query filter if they don't

`https://api-stage.wellcomecollection.org/content/v0/events?aggregations=format%2Caudience%2Cinterpretation%2Clocation%2CisAvailableOnline`

https://github.com/wellcomecollection/docs/blob/main/adr/api_faceting.md
