#!/usr/bin/env bash
set -eo pipefail

yarn clean
yarn build
yarn install --frozen-lockfile --production

pushd dist
zip -rq ../package.zip .
popd
zip -urq package.zip ./node_modules

# Restore dev tools
yarn install --frozen-lockfile
