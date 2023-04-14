#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

ROOT=$(git rev-parse --show-toplevel)
PROJECT_DIR="$ROOT/pipeline"
PACKAGE_FILE="$PROJECT_DIR/package.zip"

yarn clean
yarn build
yarn install --frozen-lockfile --production

cd $PROJECT_DIR/dist
zip -rq $PACKAGE_FILE .
cd $ROOT
zip -urq $PACKAGE_FILE node_modules

# Restore dev tools
yarn install --frozen-lockfile
