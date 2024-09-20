import { Client as ElasticClient } from "@elastic/elasticsearch";
import { SearchRequest } from "@elastic/elasticsearch/lib/api/types";
import supertest from "supertest";
import createApp from "@weco/content-api/src/app";
import { URL, URLSearchParams } from "url";

const elasticsearchRequestForURL = async (
  url: string,
): Promise<SearchRequest> => {
  const searchSpy = jest.fn();
  const app = createApp(
    { elastic: { search: searchSpy } as unknown as ElasticClient },
    {
      pipelineDate: "2222-22-22",
      articlesIndex: "test-articles",
      eventsIndex: "test-events",
      venuesIndex: "test-venues",
      publicRootUrl: new URL("http://test.test/test"),
    },
  );
  const api = supertest.agent(app);
  await api.get(url);
  return searchSpy.mock.lastCall[0] as SearchRequest;
};

describe("articles query", () => {
  // The purpose of this test is as a smoke test for the question,
  // "do we understand how we map a given query into an ES request?"
  it("makes the expected query to ES for a given set of query parameters", async () => {
    const aggregations = "format,contributors.contributor";
    const format = "test-format";
    const contributor = "test-contributor";
    const pageSize = 42;
    const page = 9;
    const dateFrom = "2022-02-22";
    const dateTo = "2023-03-23";
    const sort = "publicationDate";
    const sortOrder = "asc";
    const query = "henry wellcome";

    const params = new URLSearchParams({
      aggregations,
      format,
      page,
      pageSize,
      sort,
      sortOrder,
      query,
      "publicationDate.from": dateFrom,
      "publicationDate.to": dateTo,
      "contributors.contributor": contributor,
    } as unknown as Record<string, string>);
    const esRequest = await elasticsearchRequestForURL(
      `/articles?${params.toString()}`,
    );

    expect(esRequest.from).toBe((page - 1) * pageSize);
    expect(esRequest.size).toBe(pageSize);
    expect(esRequest.aggregations).toContainAllKeys(aggregations.split(","));

    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(query);
    expect(JSON.stringify(esRequest.query?.bool?.filter)).toInclude(dateFrom);
    expect(JSON.stringify(esRequest.query?.bool?.filter)).toInclude(dateTo);
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      contributor,
    );
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      format,
    );

    expect(esRequest).toMatchSnapshot();
  });
});

describe("events query", () => {
  // The purpose of this test is as a smoke test for the question,
  // "do we understand how we map a given query into an ES request?"
  it("makes the expected query to ES for a given set of query parameters", async () => {
    const aggregations = "format,interpretation";
    const format = "test-format";
    const interpretation = "test-interpretation";
    const pageSize = 20;
    const page = 7;
    const sortOrder = "asc";
    const query = "henry wellcome";

    const params = new URLSearchParams({
      aggregations,
      format,
      interpretation,
      page,
      pageSize,
      sortOrder,
      query,
    } as unknown as Record<string, string>);
    const esRequest = await elasticsearchRequestForURL(
      `/events?${params.toString()}`,
    );

    expect(esRequest.from).toBe((page - 1) * pageSize);
    expect(esRequest.size).toBe(pageSize);
    expect(esRequest.aggregations).toContainAllKeys(aggregations.split(","));

    expect(JSON.stringify(esRequest.query?.bool?.must)).toInclude(query);
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      interpretation,
    );
    expect(JSON.stringify(esRequest.post_filter?.bool?.filter)).toInclude(
      format,
    );

    expect(esRequest).toMatchSnapshot();
  });
});
