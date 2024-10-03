import { WebhookBodyAPIUpdate } from '@prismicio/types';
import { EventBridgeEvent } from 'aws-lambda';

export const eventBridgePrismicEvent = (
  documents: string[]
): EventBridgeEvent<'document-unpublish', WebhookBodyAPIUpdate> => ({
  account: '',
  id: '',
  region: '',
  resources: [],
  source: '',
  time: '',
  version: '',
  'detail-type': 'document-unpublish',
  detail: {
    type: 'api-update',
    domain: '',
    apiUrl: '',
    secret: '',
    releases: {},
    masks: {},
    tags: {},
    documents,
  },
});
