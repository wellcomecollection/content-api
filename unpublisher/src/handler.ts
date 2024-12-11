import { Client as ElasticClient } from '@elastic/elasticsearch';
import { WebhookBodyAPIUpdate } from '@prismicio/types';
import { EventBridgeHandler } from 'aws-lambda';

import { getConfig } from './config';
import { createUnpublisher } from './unpublisher';

const config = getConfig();

const articlesUnpublisher = createUnpublisher(config.indices.articlesIndex);
const eventDocumentsUnpublisher = createUnpublisher(
  config.indices.eventdocumentsIndex
);
const addressablesUnplublisher = createUnpublisher(
  config.indices.addressablesIndex
);

type Clients = {
  elastic: ElasticClient;
};

export const createHandler =
  (
    clients: Clients
  ): EventBridgeHandler<'document-unpublish', WebhookBodyAPIUpdate, void> =>
  async event => {
    const unpublishedDocuments = event.detail.documents;

    await articlesUnpublisher(clients, unpublishedDocuments);
    await eventDocumentsUnpublisher(clients, unpublishedDocuments);
    await addressablesUnplublisher(clients, unpublishedDocuments);
  };
