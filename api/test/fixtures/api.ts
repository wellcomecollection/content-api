import {
  Client as ElasticClient,
  errors as elasticErrors,
} from '@elastic/elasticsearch';
import supertest from 'supertest';
import { URL } from 'url';

import createApp from '@weco/content-api/src/app';
import { Displayable } from '@weco/content-api/src/types';

type Identified = {
  id: string | number;
};

const elastic404 = () =>
  new elasticErrors.ResponseError({
    statusCode: 404,
    body: undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: {} as any,
    warnings: [],
  });

const testAddressablesIndex = 'test-addressables';
const testArticlesIndex = 'test-articles';
const testEventsIndex = 'test-events';
const testVenuesIndex = 'test-venue';

export const mockConfig = {
  pipelineDate: '2222-22-22',
  addressablesIndex: testAddressablesIndex,
  articlesIndex: testArticlesIndex,
  eventsIndex: testEventsIndex,
  venuesIndex: testVenuesIndex,
  publicRootUrl: new URL('http://test.test/test'),
};

export const mockedApi = <T extends Displayable & Identified>(
  documents: T[]
) => {
  const documentsMap = new Map(documents.map(d => [d.id, d]));

  const elasticClientGet = jest.fn(
    ({ id, index }: Parameters<ElasticClient['get']>[0]) => {
      if (
        documentsMap.has(id) &&
        (index === testAddressablesIndex ||
          index === testArticlesIndex ||
          index === testEventsIndex ||
          index === testVenuesIndex)
      ) {
        return {
          _source: documentsMap.get(id),
        };
      } else {
        throw elastic404();
      }
    }
  );

  const elasticClientSearch = jest.fn(
    (params: Parameters<ElasticClient['search']>[0]) => {
      if (
        params?.index === testAddressablesIndex ||
        params?.index === testArticlesIndex ||
        params?.index === testEventsIndex ||
        params?.index === testVenuesIndex
      ) {
        return {
          hits: {
            total: documents.length,
            hits: documents.map(doc => ({
              _source: doc,
            })),
          },
        };
      } else {
        throw elastic404();
      }
    }
  );

  const app = createApp(
    {
      elastic: {
        get: elasticClientGet,
        search: elasticClientSearch,
      } as unknown as ElasticClient,
    },
    mockConfig
  );

  return {
    agent: supertest.agent(app),
    mocks: {
      elasticClientSearch,
      elasticClientGet,
    },
  };
};
