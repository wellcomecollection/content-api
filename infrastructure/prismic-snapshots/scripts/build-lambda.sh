#!/bin/bash

# Build Lambda deployment package with dependencies
# This script is called by Terraform to create a proper Lambda zip
# Usage: build-lambda.sh <lambda_name> <output_file>

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <lambda_name> <output_file>"
  exit 1
fi

LAMBDA_NAME="$1"
OUTPUT_FILE="$2"


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/../lambda"
PROJECT_DIR="$SCRIPT_DIR/.."

# Create temporary directory for Lambda package
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "Building Lambda package for $LAMBDA_NAME..."

# Copy the Lambda function code
cp "$LAMBDA_DIR/${LAMBDA_NAME}.js" "$TEMP_DIR/index.js"

# Copy and adapt package.json for Lambda
jq '{
  name: ("'"${LAMBDA_NAME}"'-lambda"),
  version: .version,
  description: ("Lambda function for '"${LAMBDA_NAME}"'"),
  main: "index.js",
  dependencies: .dependencies
}' "$PROJECT_DIR/package.json" > "$TEMP_DIR/package.json"

# Install dependencies
cd "$TEMP_DIR"
npm install --production --silent

# Create deployment package
cd "$TEMP_DIR"
zip -r "$OUTPUT_FILE" . > /dev/null

echo "Lambda package created: $OUTPUT_FILE"
