#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

yarn clean
yarn build
yarn install --frozen-lockfile --production

pushd dist
zip -rq ../package.zip .
popd
zip -urq package.zip ../node_modules

# Restore dev tools
yarn install --frozen-lockfile
