#!/usr/bin/env node

// Test script for prismic-backup-trigger Lambda
// Run with: node test-prismic-backup-trigger.js

// Load environment variables from .env in prismic-snapshots directory
require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

// Set environment variables
process.env.AWS_REGION = 'eu-west-1';
process.env.BUCKET_NAME = 'wellcomecollection-prismic-assets';

// For LocalStack testing, set dummy credentials if not already set
if (!process.env.AWS_ACCESS_KEY_ID) {
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  console.log('Using dummy AWS credentials for LocalStack');
}

// For LocalStack, uncomment this:
process.env.S3_ENDPOINT = 'http://localhost:4566';

// Load bearer token from environment or prompt to set it
if (!process.env.PRISMIC_BEARER_TOKEN) {
  console.error('Error: PRISMIC_BEARER_TOKEN environment variable is required');
  console.error('Add it to infrastructure/prismic-snapshots/.env file');
  process.exit(1);
}

// Import the Lambda handler
const lambda = require('../lambda/prismic-backup-trigger.js');

// Mock event and context
const event = {};
const context = {
  functionName: 'test-prismic-assets',
  requestId: 'test-request-id',
};

console.log('Testing prismic-backup-trigger Lambda locally...\n');

// Invoke the handler
lambda
  .handler(event, context)
  .then(result => {
    console.log('\n=== Lambda Response ===');
    console.log('Number of batches:', result.items?.length || 0);

    if (result.items && result.items.length > 0) {
      console.log('First batch size:', result.items[0].length);
      const totalAssets = result.items.reduce((sum, b) => sum + b.length, 0);
      console.log('Total assets to download:', totalAssets);

      // Show first batch as JSON
      console.log('\n=== First Batch (JSON) ===');
      console.log(JSON.stringify(result.items[0], null, 2));

      // Show batch sizes
      console.log('\n=== Batch Sizes ===');
      result.items.forEach((batch, i) => {
        console.log(`Batch ${i + 1}: ${batch.length} assets`);
      });
    }
  })
  .catch(error => {
    console.error('\n=== Lambda Error ===');
    console.error(error);
    process.exit(1);
  });
