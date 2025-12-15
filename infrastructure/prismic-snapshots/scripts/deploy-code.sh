#!/bin/bash

# Deploy Prismic Lambda Code
# Usage: ./deploy-code.sh <lambda-name>
# Example: ./deploy-code.sh prismic-snapshot

set -euo pipefail

# Check for required parameter
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <lambda-name>"
    echo "Example: $0 prismic-snapshot"
    exit 1
fi

# Configuration
LAMBDA_NAME="$1"
LAMBDA_CODE_FILE="${LAMBDA_NAME}-deployment.zip"

echo "Deploying Lambda Code: $LAMBDA_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Verify required files exist
if [ ! -f "$PROJECT_ROOT/lambda/${LAMBDA_NAME}.js" ]; then
    echo "Missing expected Lambda source: $PROJECT_ROOT/lambda/${LAMBDA_NAME}.js"
    exit 1
fi

# Check if Lambda function exists
if ! AWS_PROFILE=catalogue-developer aws lambda get-function --function-name "$LAMBDA_NAME" > /dev/null 2>&1; then
    echo "Lambda function '$LAMBDA_NAME' not found."
    echo "Please deploy the infrastructure first using:"
    echo "cd infrastructure/prismic-snapshots && ./scripts/deploy.sh"
    exit 1
fi

echo "Lambda function '$LAMBDA_NAME' found"

echo "Building Lambda package..."

# Use the shared build script that Terraform uses
"$SCRIPT_DIR/build-lambda.sh" "$LAMBDA_NAME" "$PROJECT_ROOT/$LAMBDA_CODE_FILE"

# Deploy Lambda
echo "Updating Lambda function code..."
AWS_PROFILE=catalogue-developer aws lambda update-function-code \
    --function-name "$LAMBDA_NAME" \
    --zip-file "fileb://$PROJECT_ROOT/$LAMBDA_CODE_FILE"

echo "Waiting for update to complete..."
AWS_PROFILE=catalogue-developer aws lambda wait function-updated --function-name "$LAMBDA_NAME"

# Get function info
FUNCTION_INFO=$(AWS_PROFILE=catalogue-developer aws lambda get-function --function-name "$LAMBDA_NAME")
LAST_MODIFIED=$(echo "$FUNCTION_INFO" | jq -r '.Configuration.LastModified')
CODE_SIZE=$(echo "$FUNCTION_INFO" | jq -r '.Configuration.CodeSize')

echo ""
echo "Lambda code deployment completed!"
echo "Function: $LAMBDA_NAME"
echo "Last Modified: $LAST_MODIFIED"
echo "Code Size: $(numfmt --to=iec --suffix=B $CODE_SIZE)"

# Cleanup
rm -f "$PROJECT_ROOT/$LAMBDA_CODE_FILE"

echo ""
echo "Test the deployment:"
echo "AWS_PROFILE=catalogue-developer aws lambda invoke --function-name $LAMBDA_NAME --payload '{}' response.json"
