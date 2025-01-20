## How to run

Log in to AWS and make sure you're in the `/api` repo.
Then run
`AWS_PROFILE=catalogue-developer yarn dev`

## Tests

The tests save [Jest snapshots](https://jestjs.io/docs/snapshot-testing) of the expected output.

To update them, you'll need to run `yarn jest --updateSnapshot`.
