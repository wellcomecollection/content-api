import * as prismic from '@prismicio/client';

import { uploadToS3 } from './services/s3';
import { Clients } from './types';

// All known Prismic document types based on the existing pipeline
const ALL_DOCUMENT_TYPES = [
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
] as const;

export const backupPrismicContent = async (
  clients: Clients,
  bucketName: string
): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`Starting Prismic backup at ${timestamp}`);

  for (const documentType of ALL_DOCUMENT_TYPES) {
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
