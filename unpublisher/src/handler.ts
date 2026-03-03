import { Client as ElasticClient } from '@elastic/elasticsearch';
import { WebhookBodyAPIUpdate } from '@prismicio/types';
import { EventBridgeEvent } from 'aws-lambda';

import { getConfig } from './config';
import {
  createAddressablesUnpublisher,
  createUnpublisher,
} from './unpublisher';

const config = getConfig();

const articlesUnpublisher = createUnpublisher(config.indices.articlesIndex);
const eventDocumentsUnpublisher = createUnpublisher(
  config.indices.eventdocumentsIndex
);
const addressablesUnpublisher = createAddressablesUnpublisher(
  config.indices.addressablesIndex
);

type Clients = {
  elastic: ElasticClient;
};

export const createHandler =
  (clients: Clients) =>
  async (
    event: EventBridgeEvent<'document-unpublish', WebhookBodyAPIUpdate>
  ): Promise<void> => {
    const unpublishedDocuments = event.detail.documents;

    await articlesUnpublisher(clients, unpublishedDocuments);
    await eventDocumentsUnpublisher(clients, unpublishedDocuments);
    await addressablesUnpublisher(clients, unpublishedDocuments);
  };
