import { Context } from 'aws-lambda';
import { argv } from 'node:process';

import { getElasticClient } from '@weco/content-common/services/elasticsearch';

import { eventBridgePrismicEvent } from './event';
import { createHandler } from './handler';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_1, _2, ...deletionIds] = argv;

getElasticClient({
  pipelineDate: '2025-01-20',
  serviceName: 'unpublisher',
  hostEndpointAccess: 'public',
}).then(async elasticClient => {
  const handler = createHandler({ elastic: elasticClient });
  await handler(eventBridgePrismicEvent(deletionIds), {} as Context, () => {});
});
