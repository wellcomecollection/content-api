import { WebhookBodyAPIUpdate } from '@prismicio/types';
import { EventBridgeEvent } from 'aws-lambda';

import { getElasticClient } from '@weco/content-common/services/elasticsearch';

import { getConfig } from './config';
import { createHandler } from './handler';

const config = getConfig();

const initialiseHandler = async () => {
  const elasticClient = await getElasticClient({
    pipelineDate: config.pipelineDate,
    serviceName: 'unpublisher',
    hostEndpointAccess: 'private',
  });
  return createHandler({ elastic: elasticClient });
};

const handlerPromise = initialiseHandler();

export const handler = async (
  event: EventBridgeEvent<'document-unpublish', WebhookBodyAPIUpdate>
) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event);
};
