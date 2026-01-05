## How to run

Log in to AWS and make sure you're in the `/api` repo.
Then run
`AWS_PROFILE=catalogue-developer yarn dev`

## Tests

The tests save [Jest snapshots](https://jestjs.io/docs/snapshot-testing) of the expected output.

To update them, you'll need to run `yarn jest --updateSnapshot`.

## Event formats filtering

The `/events` endpoint supports inclusive and exclusive format filters via the `format` query parameter.

- To include specific formats, pass their IDs: `?format=<formatId1>,<formatId2>`.
- To exclude formats, prefix them with `!`: `?format=!<formatId1>,!<formatId2>`.

Additionally, the API supports human-friendly aliases for the
Prismic format IDs.

Examples:

- Use a label to include only `workshop` events:

  `/events?format=workshop`

- Use a label to exclude `shopping` events:

  `/events?format=!shopping`
