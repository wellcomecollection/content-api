import { Context } from 'aws-lambda';

import { getElasticClient } from '@weco/content-common/services/elasticsearch';

import { BackupEvent, WindowEvent } from './event';
import { createHandler } from './handler';
import { createPrismicClient } from './services/prismic';

const prismicClient = createPrismicClient();

const operation = process.argv[2];

let event: WindowEvent | BackupEvent;

if (operation === 'backup') {
  // Set up environment for local backup testing
  process.env.BACKUP_BUCKET_NAME =
    process.env.BACKUP_BUCKET_NAME || 'test-backup-bucket';

  event = {
    operation: 'backup',
  };
} else {
  const contentType = (operation ?? 'all') as
    | 'addressables'
    | 'articles'
    | 'events'
    | 'venues'
    | 'all';

  // Reindexes all documents by default
  event = {
    contentType,
    start: undefined,
    end: undefined,
  };
}

getElasticClient({
  pipelineDate: '2025-07-30',
  serviceName: 'pipeline',
  hostEndpointAccess: 'public',
}).then(elasticClient => {
  const handler = createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
  return handler(event, {} as Context, () => {});
});
