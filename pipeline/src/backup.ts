import { uploadToS3 } from './services/s3';
import { Clients } from './types';

/**
 * Fetches all available custom types from the Prismic Custom Types API
 * @param repositoryName The Prismic repository name
 * @returns Array of custom type IDs
 */
const fetchPrismicCustomTypes = async (
  repositoryName: string
): Promise<string[]> => {
  try {
    const url = `https://${repositoryName}.cdn.prismic.io/api/custom-types`;
    console.log(`Fetching custom types from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch custom types: ${response.status} ${response.statusText}`
      );
    }

    const customTypes = (await response.json()) as Record<string, unknown>;
    const typeIds = Object.keys(customTypes);

    console.log(`Found ${typeIds.length} custom types: ${typeIds.join(', ')}`);
    return typeIds;
  } catch (error) {
    console.error('Error fetching custom types from API:', error);
    console.log('Falling back to known document types');

    // Fallback to known document types if API call fails
    return [
      'articles',
      'books',
      'events',
      'exhibitions',
      'exhibition-texts',
      'exhibition-highlight-tours',
      'pages',
      'projects',
      'seasons',
      'visual-stories',
      'webcomics',
      'collection-venue',
    ];
  }
};

export const backupPrismicContent = async (
  clients: Clients,
  bucketName: string
): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`Starting Prismic backup at ${timestamp}`);

  // Fetch available custom types dynamically
  const documentTypes = await fetchPrismicCustomTypes('wellcomecollection');

  for (const documentType of documentTypes) {
    try {
      console.log(`Backing up ${documentType}...`);

      // Fetch all documents of this type from Prismic
      const documents = await clients.prismic.getAllByType(documentType);

      // Create S3 key with timestamp and document type
      const s3Key = `backups/${timestamp}/${documentType}.json`;

      // Upload to S3
      await uploadToS3(bucketName, s3Key, JSON.stringify(documents, null, 2));

      console.log(
        `Backed up ${documents.length} ${documentType} documents to ${s3Key}`
      );
    } catch (error) {
      console.error(`Error backing up ${documentType}:`, error);
      // Continue with other document types even if one fails
    }
  }

  console.log(`Completed Prismic backup at ${timestamp}`);
};
