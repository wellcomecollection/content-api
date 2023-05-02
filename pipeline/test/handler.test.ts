import type { Client as ElasticClient } from "@elastic/elasticsearch";
import type { Client as PrismicClient } from "@prismicio/client";
import { createHandler } from "../src/handler";
import { Context } from "aws-lambda";
import { Readable } from "node:stream";
import readableToArray from "./fixtures/readableToArray";
import { ElasticsearchArticle } from "../src/types";
import { getSnapshots } from "./fixtures/prismic-snapshots";

describe("handler", () => {
  it("fetches articles and webcomics from prismic and indexes them into ES", async () => {
    const allDocs = getSnapshots("articles", "webcomics");

    const elasticIndexCreator = jest.fn().mockResolvedValue(true);
    const elasticBulkHelper = jest.fn().mockResolvedValueOnce({
      successful: allDocs.length,
      time: 1234,
    });
    const elasticClient = {
      indices: {
        create: elasticIndexCreator,
      },
      helpers: {
        bulk: elasticBulkHelper,
      },
    } as unknown as ElasticClient;

    const prismicClient = {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          results: allDocs,
        })
        .mockResolvedValueOnce({ results: [] }),
    };

    const testHandler = createHandler({
      elastic: elasticClient,
      prismic: prismicClient as unknown as PrismicClient,
    });
    await testHandler({}, {} as Context, () => {});

    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = await readableToArray<ElasticsearchArticle>(
      elasticBulkHelper.mock.lastCall[0].datasource as Readable
    );
    expect(indexedDocs.map((doc) => doc.id)).toIncludeSameMembers(
      allDocs.map((doc) => doc.id)
    );
  });
});
