#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

yarn run esbuild ./src/lambda.js \
  --bundle \
  --platform=node \
  --target=node18 \
  --sourcemap=external \
  --outdir=dist

cd dist
zip -rq ../package.zip .
