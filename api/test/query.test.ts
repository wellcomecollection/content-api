import { Client as ElasticClient } from '@elastic/elasticsearch';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import supertest from 'supertest';
import { URLSearchParams } from 'url';

import createApp from '@weco/content-api/src/app';

import { mockConfig } from './fixtures/api';

const elasticsearchRequestForURL = async (
  url: string
): Promise<SearchRequest> => {
  const searchSpy = jest.fn();
  const app = createApp(
    { elastic: { search: searchSpy } as unknown as ElasticClient },
    mockConfig
  );
  const api = supertest.agent(app);
  await api.get(url);
  return searchSpy.mock.lastCall[0] as SearchRequest;
};

describe('articles query', () => {
  // The purpose of this test is as a smoke test for the question,
  // "do we understand how we map a given query into an ES request?"
  it('makes the expected query to ES for a given set of query parameters', async () => {
    const aggregations = 'format,contributors.contributor';
    const format = 'test-format';
    const contributor = 'test-contributor';
    const pageSize = 42;
    const page = 9;
    const dateFrom = '2022-02-22';
    const dateTo = '2023-03-23';
    const sort = 'publicationDate';
    const sortOrder = 'asc';
    const query = 'henry wellcome';

    const params = new URLSearchParams({
      aggregations,
      format,
      page,
      pageSize,
      sort,
      sortOrder,
      query,
      'publicationDate.from': dateFrom,
      'publicationDate.to': dateTo,
      'contributors.contributor': contributor,
    } as unknown as Record<string, string>);
    const esRequest = await elasticsearchRequestForURL(
      `/articles?${params.toString()}`
    );

    expect(esRequest.from).toBe((page - 1) * pageSize);
    expect(esRequest.size).toBe(pageSize);
    expect(esRequest.aggregations).toContainAllKeys(aggregations.split(','));

    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(query);
    expect(JSON.stringify(esRequest.query?.bool?.filter)).toInclude(dateFrom);
    expect(JSON.stringify(esRequest.query?.bool?.filter)).toInclude(dateTo);
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      contributor
    );
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      format
    );

    expect(esRequest).toMatchSnapshot();
  });
});

describe('events query', () => {
  // The purpose of this test is as a smoke test for the question,
  // "do we understand how we map a given query into an ES request?"
  it('makes the expected query to ES for a given set of query parameters', async () => {
    const aggregations = 'format,interpretation,timespan';
    const format = 'test-format';
    const interpretation = 'test-interpretation';
    const pageSize = 20;
    const page = 7;
    const sortOrder = 'asc';
    const query = 'henry wellcome';
    const timespan = 'past';

    const params = new URLSearchParams({
      aggregations,
      format,
      interpretation,
      page,
      pageSize,
      sortOrder,
      query,
      timespan,
    } as unknown as Record<string, string>);
    const esRequest = await elasticsearchRequestForURL(
      `/events?${params.toString()}`
    );

    expect(esRequest.from).toBe((page - 1) * pageSize);
    expect(esRequest.size).toBe(pageSize);
    expect(esRequest.aggregations).toContainAllKeys(aggregations.split(','));

    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(query);
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      interpretation
    );
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      format
    );

    expect(esRequest).toMatchSnapshot();
  });
});

describe('addressables query', () => {
  it('makes the expected query to ES for a given set of query parameters', async () => {
    const pageSize = 30;
    const page = 2;
    const query = 'henry wellcome';
    const linkedWork = 'work123';

    const params = new URLSearchParams({
      page,
      pageSize,
      query,
      linkedWork,
    } as unknown as Record<string, string>);
    const esRequest = await elasticsearchRequestForURL(
      `/all?${params.toString()}`
    );
    console.log(esRequest);

    expect(esRequest.from).toBe((page - 1) * pageSize);
    expect(esRequest.size).toBe(pageSize);

    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(query);
    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(linkedWork);

    expect(esRequest).toMatchSnapshot();
  });
});
