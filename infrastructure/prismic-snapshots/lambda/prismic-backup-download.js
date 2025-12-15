const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true, // Required for LocalStack
  }),
});
const BUCKET_NAME = process.env.BUCKET_NAME;

if (!BUCKET_NAME) {
  throw new Error('Missing required environment variable: BUCKET_NAME');
}
async function downloadAsset(url, retryCount = 0) {
  const maxRetries = 1;

  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      // Don't retry 404s - asset doesn't exist
      if (response.status === 404) {
        console.log(`Asset not found (404): ${url}`);
        return { success: false, error: '404 Not Found', url };
      }

      // Retry other errors once
      if (retryCount < maxRetries) {
        console.log(
          `Failed to download (${response.status}), retrying: ${url}`
        );
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        return downloadAsset(url, retryCount + 1);
      }

      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
      error.statusCode = response.status;
      throw error;
    }

    const buffer = await response.arrayBuffer();
    return { success: true, buffer, url };
  } catch (error) {
    // Retry network errors once
    if (retryCount < maxRetries) {
      console.log(`Network error, retrying: ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return downloadAsset(url, retryCount + 1);
    }

    console.error(
      `Failed to download after ${maxRetries + 1} attempts: ${url}`,
      error
    );
    return { success: false, error: error.message, url };
  }
}

async function uploadToS3(id, buffer, url) {
  try {
    // Extract filename from URL (already contains the ID)
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split('/').pop() || id;
    const key = `media-library/files/${filename}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      Metadata: {
        'prismic-asset-id': id,
        'original-url': url,
      },
    });

    await s3Client.send(uploadCommand);
    console.log(`Uploaded: ${key}`);
    return { success: true, key, id };
  } catch (error) {
    console.error(`Failed to upload ${id} to S3:`, error);
    return { success: false, error: error.message, id, url };
  }
}

async function processAssetBatch(batch) {
  const results = {
    total: batch.length,
    successful: 0,
    failed: 0,
    errors: [],
  };
  const concurrency = Number(process.env.BATCH_CONCURRENCY || '5');

  for (let i = 0; i < batch.length; i += concurrency) {
    const chunk = batch.slice(i, i + concurrency);

    const settledResults = await Promise.allSettled(
      chunk.map(async asset => {
        const { id, url } = asset;

        const downloadResult = await downloadAsset(url);

        if (!downloadResult.success) {
          return {
            success: false,
            id,
            url,
            stage: 'download',
            error: downloadResult.error,
          };
        }

        const uploadResult = await uploadToS3(id, downloadResult.buffer, url);

        if (!uploadResult.success) {
          return {
            success: false,
            id,
            url,
            stage: 'upload',
            error: uploadResult.error,
          };
        }

        return { success: true, id, url };
      })
    );

    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        const value = result.value;

        if (value.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({
            id: value.id,
            url: value.url,
            stage: value.stage,
            error: value.error,
          });
        }
      } else {
        results.failed++;
        results.errors.push({
          id: null,
          url: null,
          stage: 'unknown',
          error:
            (result.reason && result.reason.message) ||
            'Unknown error while processing asset',
        });
      }
    }
  }

  return results;
}

exports.handler = async (event, context) => {
  console.log('Download Prismic assets Lambda triggered', { event, context });

  try {
    // Event contains a batch of assets to download
    const batch = event.batch;

    if (!Array.isArray(batch)) {
      throw new Error('Invalid input: batch must be an array of assets');
    }

    console.log(`Processing batch of ${batch.length} assets`);

    const results = await processAssetBatch(batch);

    console.log(
      `Completed: ${results.successful} successful, ${results.failed} failed`
    );

    return {
      statusCode: results.failed > 0 ? 207 : 200, // 207 Multi-Status if partial success
      body: JSON.stringify(results),
    };
  } catch (error) {
    console.error('Error processing asset batch:', error);

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: 'Error processing asset batch',
        error: error.message,
      }),
    };
  }
};
