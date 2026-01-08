#!/usr/bin/env node

// Test script for prismic-backup-download Lambda
// Run with: node test-prismic-backup-download.js

// Set environment variables
process.env.AWS_REGION = 'eu-west-1';
process.env.BUCKET_NAME = 'wellcomecollection-prismic-downloads';

// For LocalStack testing, set dummy credentials if not already set
if (!process.env.AWS_ACCESS_KEY_ID) {
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  console.log('Using dummy AWS credentials for LocalStack');
}

// For LocalStack, uncomment this:
process.env.S3_ENDPOINT = 'http://localhost:4566';

// Import the Lambda handler
const lambda = require('../lambda/prismic-backup-download.js');

// Mock event with a small test batch (5 real assets from Prismic)
const event = {
  batch: [
    {
      id: 'aQ44qbpReVYa4P8y',
      url: 'https://images.prismic.io/wellcomecollection/aQ44qbpReVYa4P8y_EP0003124_20251023_2795-Edit.jpg?auto=format,compress',
    },
    {
      id: 'aQ44pbpReVYa4P8v',
      url: 'https://images.prismic.io/wellcomecollection/aQ44pbpReVYa4P8v_EP0003124_20251023_2269.jpg?auto=format,compress',
    },
    {
      id: 'aQ4RGrpReVYa4PcO',
      url: 'https://images.prismic.io/wellcomecollection/aQ4RGrpReVYa4PcO_Scroll.jpg?auto=format,compress',
    },
    {
      id: 'aQ4LP7pReVYa4PU8',
      url: 'https://images.prismic.io/wellcomecollection/aQ4LP7pReVYa4PU8_Expecting_VS_Cover1.jpg?auto=format,compress',
    },
    {
      id: 'aQ4IJbpReVYa4PTB',
      url: 'https://images.prismic.io/wellcomecollection/aQ4IJbpReVYa4PTB_Expecting_Sensory_Map_Cover1.jpg?auto=format,compress',
    },
  ],
};

const context = {
  functionName: 'test-prismic-download-assets',
  requestId: 'test-request-id',
};

console.log('Testing prismic-backup-download Lambda locally...');
console.log(`Processing ${event.batch.length} test assets\n`);

// Invoke the handler
lambda
  .handler(event, context)
  .then(result => {
    console.log('\n=== Lambda Response ===');
    console.log('Status Code:', result.statusCode);

    const body = JSON.parse(result.body);
    console.log('Total:', body.total);
    console.log('Successful:', body.successful);
    console.log('Failed:', body.failed);

    if (body.errors && body.errors.length > 0) {
      console.log('\nErrors:');
      body.errors.forEach(err => {
        console.log(`  - ${err.id}: ${err.error} (${err.stage})`);
      });
    }

    console.log('\nFull response:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('\n=== Lambda Error ===');
    console.error(error);
    process.exit(1);
  });
