import type { Client as ElasticClient } from '@elastic/elasticsearch';
import * as prismic from '@prismicio/client';

import { createETLPipeline } from '@weco/content-pipeline/src/extractTransformLoad';
import {
  articlesQuery,
  eventDocumentsQuery,
  webcomicsQuery,
  wrapQueries,
} from '@weco/content-pipeline/src/graph-queries';
import { addressablesQuery } from '@weco/content-pipeline/src/graph-queries/addressables';
import { isFilledLinkToDocument } from '@weco/content-pipeline/src/helpers/type-guards';
import {
  addressables,
  articles,
  events,
} from '@weco/content-pipeline/src/indices';
import { transformAddressable } from '@weco/content-pipeline/src/transformers/addressables';
import { transformArticle } from '@weco/content-pipeline/src/transformers/article';
import { transformEventDocument } from '@weco/content-pipeline/src/transformers/eventDocument';
import { ArticlePrismicDocument } from '@weco/content-pipeline/src/types/prismic';

import {
  createElasticBulkHelper,
  createElasticScrollDocuments,
} from './fixtures/elastic';
import { prismicGet } from './fixtures/prismic';
import { getSnapshots } from './fixtures/prismic-snapshots';

describe('Extract, transform and load eventDocuments', () => {
  it('fetches eventDocuments from prismic and indexes them into ES', async () => {
    const allDocs = getSnapshots(['events']);

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const [elasticBulkHelper, getIndexedDocuments] = createElasticBulkHelper();
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
      },
    } as unknown as ElasticClient;

    const prismicClient = {
      get: prismicGet(allDocs),
    } as unknown as prismic.Client;

    const eventPipeline = createETLPipeline({
      indexConfig: events,
      graphQuery: eventDocumentsQuery,
      parentDocumentTypes: new Set(['events', 'exhibitions']),
      transformer: transformEventDocument,
    });

    await eventPipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: 'events' }
    );

    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = getIndexedDocuments();
    expect(indexedDocs.map(doc => doc.id)).toIncludeSameMembers(
      allDocs.map(doc => doc.id)
    );
  });

  it('finds parent documents of updated children and re-fetches and indexes them', async () => {
    const eventFormats = getSnapshots(['event-formats']);
    // Any event which contains any of the `event-formats`
    const parentArticles = getSnapshots(['events']).filter(event =>
      eventFormats.some(
        eventFormat =>
          isFilledLinkToDocument(event.data.format) &&
          eventFormat.id === event.data.format.id
      )
    );

    const prismicGetByIDs = jest.fn().mockResolvedValue({
      results: parentArticles,
    });
    const prismicClient = {
      get: prismicGet(eventFormats),
      getByIDs: prismicGetByIDs,
    } as unknown as prismic.Client;

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const [elasticBulkHelper, getIndexedDocuments] = createElasticBulkHelper();
    const elasticScrollDocuments = createElasticScrollDocuments(parentArticles);
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
        scrollDocuments: elasticScrollDocuments,
      },
    } as unknown as ElasticClient;

    const eventPipeline = createETLPipeline({
      indexConfig: events,
      graphQuery: eventDocumentsQuery,
      parentDocumentTypes: new Set(['events']),
      transformer: transformEventDocument,
    });

    await eventPipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: 'events' }
    );

    const parentIds = parentArticles.map(doc => doc.id);
    const prismicRequestedIds = prismicGetByIDs.mock.calls[0][0];
    expect(prismicRequestedIds).toIncludeSameMembers(parentIds);

    const finalIndexedDocuments = getIndexedDocuments();
    expect(finalIndexedDocuments.map(doc => doc.id)).toIncludeSameMembers(
      parentIds
    );
  });
});

describe('Extract, transform and load articles', () => {
  it('fetches articles and webcomics from prismic and indexes them into ES', async () => {
    const allDocs = getSnapshots(['articles', 'webcomics']);

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const [elasticBulkHelper, getIndexedDocuments] = createElasticBulkHelper();
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
      },
    } as unknown as ElasticClient;

    const prismicClient = {
      get: prismicGet(allDocs),
    } as unknown as prismic.Client;

    const articlePipeline = createETLPipeline({
      indexConfig: articles,
      graphQuery: articlesQuery,
      parentDocumentTypes: new Set(['articles', 'webcomics']),
      transformer: transformArticle,
    });

    await articlePipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: 'articles' }
    );
    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = getIndexedDocuments();
    expect(indexedDocs.map(doc => doc.id)).toIncludeSameMembers(
      allDocs.map(doc => doc.id)
    );
  });

  it('finds parent documents of updated children and re-fetches and indexes them', async () => {
    const contributors = getSnapshots(['people']);
    // Any articles/webcomics which contain any of the `contributors`
    const parentArticles = getSnapshots<ArticlePrismicDocument>([
      'articles',
      'webcomics',
    ]).filter(article =>
      contributors.some(contributor =>
        article.data.contributors.some(
          articleContributor =>
            isFilledLinkToDocument(articleContributor.contributor) &&
            articleContributor.contributor.id === contributor.id
        )
      )
    );

    const prismicGetByIDs = jest.fn().mockResolvedValue({
      results: parentArticles,
    });
    const prismicClient = {
      get: prismicGet(contributors),
      getByIDs: prismicGetByIDs,
    } as unknown as prismic.Client;

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const [elasticBulkHelper, getIndexedDocuments] = createElasticBulkHelper();
    const elasticScrollDocuments = createElasticScrollDocuments(parentArticles);
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
        scrollDocuments: elasticScrollDocuments,
      },
    } as unknown as ElasticClient;

    const articlePipeline = createETLPipeline({
      indexConfig: articles,
      graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
      parentDocumentTypes: new Set(['articles', 'webcomics']),
      transformer: transformArticle,
    });

    await articlePipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: 'articles' }
    );
    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const parentIds = parentArticles.map(doc => doc.id);
    const prismicRequestedIds = prismicGetByIDs.mock.calls[0][0];
    expect(prismicRequestedIds).toIncludeSameMembers(parentIds);

    const finalIndexedDocuments = getIndexedDocuments();
    expect(finalIndexedDocuments.map(doc => doc.id)).toIncludeSameMembers(
      parentIds
    );
  });
});

describe('Extract, transform and load addressables', () => {
  it('fetches addressables from prismic and indexes them into ES', async () => {
    const allDocs = getSnapshots(
      [
        'articles',
        'books',
        'events',
        'exhibition-highlight-tours',
        'exhibitions',
        'exhibition-texts',
        'pages',
        'projects',
        'seasons',
        'visual-stories',
      ],
      true
    );

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const [elasticBulkHelper, getIndexedDocuments] = createElasticBulkHelper();
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
      },
    } as unknown as ElasticClient;

    const prismicClient = {
      get: prismicGet(allDocs),
    } as unknown as prismic.Client;

    const addressablePipeline = createETLPipeline({
      indexConfig: addressables,
      graphQuery: addressablesQuery,
      parentDocumentTypes: new Set([
        'articles',
        'books',
        'events',
        'exhibition-highlight-tours',
        'exhibitions',
        'exhibition-texts',
        'pages',
        'projects',
        'seasons',
        'visual-stories',
      ]),
      transformer: transformAddressable,
    });

    await addressablePipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: 'addressables' }
    );
    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const expectedIdsFromAllDocs = allDocs
      .map(d => {
        if (d.type === 'exhibition-highlight-tours') {
          return [`${d.id}/${d.type}/audio`, `${d.id}/${d.type}/bsl`];
        } else {
          return `${d.id}/${d.type}`;
        }
      })
      .flat();
    const indexedDocs = getIndexedDocuments();
    const indexedIds = indexedDocs.map(d => d.id);

    expect(indexedIds).toIncludeSameMembers(expectedIdsFromAllDocs);
  });
});
