import * as prismic from '@prismicio/client';
import { Handler } from 'aws-lambda';

import { backupPrismicContent } from './backup';
import { BackupEvent, WindowEvent } from './event';
import { createETLPipeline } from './extractTransformLoad';
import {
  articlesQuery,
  eventDocumentsQuery,
  venueQuery,
  webcomicsQuery,
  wrapQueries,
} from './graph-queries';
import { addressablesQuery } from './graph-queries/addressables';
import { addressables, articles, events, venues } from './indices';
import { transformAddressable } from './transformers/addressables';
import { transformArticle } from './transformers/article';
import { transformEventDocument } from './transformers/eventDocument';
import { transformVenue } from './transformers/venue';
import { Clients } from './types';

const loadAddressables = createETLPipeline({
  graphQuery: addressablesQuery,
  filters: [prismic.filter.not('document.tags', ['delist'])],
  indexConfig: addressables,
  parentDocumentTypes: new Set([
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
  ]),
  transformer: transformAddressable,
});

const loadArticles = createETLPipeline({
  graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
  indexConfig: articles,
  parentDocumentTypes: new Set(['articles', 'webcomics']),
  transformer: transformArticle,
});

const loadEvents = createETLPipeline({
  graphQuery: eventDocumentsQuery,
  indexConfig: events,
  parentDocumentTypes: new Set(['events', 'exhibitions']),
  transformer: transformEventDocument,
});

const loadVenues = createETLPipeline({
  graphQuery: venueQuery,
  indexConfig: venues,
  parentDocumentTypes: new Set(['collection-venue']),
  transformer: transformVenue,
});

export const createHandler =
  (clients: Clients): Handler<WindowEvent | BackupEvent> =>
  async event => {
    // Handle backup operation
    if ('operation' in event && event.operation === 'backup') {
      const bucketName = process.env.BACKUP_BUCKET_NAME;
      if (!bucketName) {
        throw new Error(
          'BACKUP_BUCKET_NAME environment variable must be set for backup operations'
        );
      }
      await backupPrismicContent(clients, bucketName);
      return;
    }

    // Handle regular window events
    const windowEvent = event as WindowEvent;
    if (!windowEvent.contentType) {
      throw new Error('Event contentType must be specified!');
    }
    if (
      windowEvent.contentType === 'all' ||
      windowEvent.contentType === 'addressables'
    ) {
      await loadAddressables(clients, windowEvent);
    }
    if (
      windowEvent.contentType === 'all' ||
      windowEvent.contentType === 'articles'
    ) {
      await loadArticles(clients, windowEvent);
    }
    if (
      windowEvent.contentType === 'all' ||
      windowEvent.contentType === 'events'
    ) {
      await loadEvents(clients, windowEvent);
    }
    if (
      windowEvent.contentType === 'all' ||
      windowEvent.contentType === 'venues'
    ) {
      await loadVenues(clients, windowEvent);
    }
  };
