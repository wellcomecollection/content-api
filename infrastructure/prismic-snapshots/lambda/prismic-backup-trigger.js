const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true, // Required for LocalStack
  }),
});
const BUCKET_NAME = process.env.BUCKET_NAME;
if (!BUCKET_NAME) {
  throw new Error('BUCKET_NAME environment variable is required');
}

function getPrismicAuthToken() {
  const token = process.env.PRISMIC_BEARER_TOKEN;

  if (!token) {
    throw new Error('PRISMIC_BEARER_TOKEN environment variable is required');
  }

  return token;
}

async function getPreviousFetchTime() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'media-library/latest-asset-snapshot-metadata.json',
    });

    const response = await s3Client.send(command);
    const body = await response.Body.transformToString();
    const latestInfo = JSON.parse(body);

    console.log(
      `Found previous fetch from ${new Date(latestInfo.fetch_started_at).toISOString()}`
    );
    return latestInfo.fetch_started_at;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      console.log('No previous fetch found - this is the first run');
      return null;
    }
    throw error;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllPrismicAssets() {
  const repo = 'wellcomecollection';
  const assetsUrlBase = 'https://asset-api.prismic.io/assets';

  const token = getPrismicAuthToken();

  let allAssets = [];
  let cursor;
  const pageSize = 5000;

  console.log(`Fetching asset list from ${repo}...`);

  let isLastPage = false;

  while (!isLastPage) {
    const url = new URL(assetsUrlBase);
    url.searchParams.set('repository', repo);
    url.searchParams.set('limit', pageSize.toString());
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      repository: repo,
    };

    console.log(`Fetching page (cursor: ${cursor || 'initial'})...`);
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const error = new Error(
        `Prismic assets request failed: ${res.status} ${res.statusText}`
      );
      error.statusCode = res.status;
      throw error;
    }

    const json = await res.json();
    // The Asset API returns { total, items, cursor }
    const items = Array.isArray(json.items) ? json.items : [];
    if (items.length > 0) {
      allAssets = allAssets.concat(items);
      console.log(
        `Fetched ${items.length} assets (total so far: ${allAssets.length} / ${json.total})`
      );
    }

    isLastPage = items.length < pageSize;
    cursor = json.cursor;

    // Delay between requests to be nice to the Prismic API and avoid rate limiting
    if (!isLastPage) {
      await delay(1000);
    }
  }

  console.log(`Finished: fetched a list of ${allAssets.length} total assets`);
  return allAssets;
}

function filterAssetsSince(assets, previousFetchTime) {
  if (!previousFetchTime) {
    return assets;
  }

  assets.forEach(asset => {
    if (typeof asset.last_modified !== 'number') {
      const id = asset.id || '<unknown>';
      throw new Error(
        `Expected numeric last_modified for asset ${id}, got ${typeof asset.last_modified}`
      );
    }
  });

  return assets.filter(asset => asset.last_modified >= previousFetchTime);
}

function deriveFilename(asset) {
  if (asset && typeof asset.filename === 'string') {
    const cleanFilename = asset.filename.trim();
    if (cleanFilename) {
      return `${asset.id}-${cleanFilename}`;
    }
  }

  if (asset && typeof asset.extension === 'string') {
    const cleanExtension = asset.extension.trim();
    if (cleanExtension) {
      const ext = cleanExtension.startsWith('.')
        ? cleanExtension
        : `.${cleanExtension}`;
      return `${asset.id}${ext}`;
    }
  }

  // Worst case, use the id only (no extension)
  return asset.id;
}

async function prepareAssetsForDownload() {
  try {
    console.log('Starting Prismic assets download...');

    // Get previous fetch time to filter assets
    const previousFetchTime = await getPreviousFetchTime();

    const fetchStartTime = Date.now();
    const assets = await fetchAllPrismicAssets();

    console.log(`Fetched asset list of ${assets.length} assets from Prismic`);

    // Filter assets modified since last fetch
    const filteredAssets = filterAssetsSince(assets, previousFetchTime);
    if (previousFetchTime) {
      console.log(
        `Filtered to ${filteredAssets.length} assets modified since last fetch`
      );
    }

    // Map filtered assets to include id, a cleaned url (no query params), and a filename
    const assetsForDownload = filteredAssets.map(asset => {
      const filename = deriveFilename(asset);

      try {
        const urlObj = new URL(asset.url);
        urlObj.search = '';
        urlObj.hash = '';
        return {
          id: asset.id,
          url: urlObj.toString(),
          filename,
        };
      } catch {
        // If URL parsing fails for any reason, fall back to the original URL
        return {
          id: asset.id,
          url: asset.url,
          filename,
        };
      }
    });

    // Batch assets into groups of 100 for parallel processing
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < assetsForDownload.length; i += batchSize) {
      batches.push(assetsForDownload.slice(i, i + batchSize));
    }

    console.log(
      `Created ${batches.length} batches of up to ${batchSize} assets each`
    );

    // Create filename with timestamp
    const timestamp = new Date();
    const filename = `prismic-assets-${timestamp.toISOString()}.json`;

    // Upload main assets file to S3 (all assets, unfiltered)
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `media-library/${filename}`,
      Body: JSON.stringify(assets, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(uploadCommand);
    console.log(
      `Successfully uploaded ${assets.length} assets to s3://${BUCKET_NAME}/${filename}`
    );

    // Create and upload latest-asset-snapshot-metadata.json pointer file
    const latestInfo = {
      filename,
      fetch_started_at: fetchStartTime,
    };

    const latestCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'media-library/latest-asset-snapshot-metadata.json',
      Body: JSON.stringify(latestInfo, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(latestCommand);
    console.log(
      `Updated latest-asset-snapshot-metadata.json pointer to ${filename}`
    );

    // Store the latest batches in S3 so the Step Functions state machine
    // can read them
    const latestBatchesKey = 'media-library/latest-batches.json';
    const batchesCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: latestBatchesKey,
      Body: JSON.stringify(batches, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(batchesCommand);
    console.log(`Updated latest-batches.json at ${latestBatchesKey}`);

    return {
      bucket: BUCKET_NAME,
      key: latestBatchesKey,
    };
  } catch (error) {
    console.error('Error creating Prismic assets snapshot:', error);

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: 'Error creating assets snapshot',
        error: error.message,
      }),
    };
  }
}

exports.handler = async (event, context) => {
  console.log('Prismic list assets Lambda triggered', { event, context });
  return await prepareAssetsForDownload();
};

exports.filterAssetsSince = filterAssetsSince;
