import * as prismic from '@prismicio/client';
import { Handler } from 'aws-lambda';

import { WindowEvent } from './event';
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
  (clients: Clients): Handler<WindowEvent> =>
  async event => {
    if (!event.contentType) {
      throw new Error('Event contentType must be specified!');
    }
    if (event.contentType === 'all' || event.contentType === 'addressables') {
      await loadAddressables(clients, event);
    }
    if (event.contentType === 'all' || event.contentType === 'articles') {
      await loadArticles(clients, event);
    }
    if (event.contentType === 'all' || event.contentType === 'events') {
      await loadEvents(clients, event);
    }
    if (event.contentType === 'all' || event.contentType === 'venues') {
      await loadVenues(clients, event);
    }
  };
