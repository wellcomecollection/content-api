import { Context } from 'aws-lambda';

import { getElasticClient } from '@weco/content-common/services/elasticsearch';

import { WindowEvent } from './event';
import { createHandler } from './handler';
import { createPrismicClient } from './services/prismic';

const prismicClient = createPrismicClient();

const contentType = (process.argv[2] ?? 'all') as
  | 'addressables'
  | 'articles'
  | 'events'
  | 'venues'
  | 'all';

// Reindexes all documents by default
const windowEvent: WindowEvent = {
  contentType,
  start: undefined,
  end: undefined,
};

getElasticClient({
  pipelineDate: '2025-01-20',
  serviceName: 'pipeline',
  hostEndpointAccess: 'public',
}).then(elasticClient => {
  const handler = createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
  return handler(windowEvent, {} as Context, () => {});
});
