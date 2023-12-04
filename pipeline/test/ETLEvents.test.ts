import type { Client as ElasticClient } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import { createHandler } from "../src/handler";
import { Context } from "aws-lambda";
import {
  ArticlePrismicDocument,
  EventPrismicDocument,
} from "../src/types/prismic";
import { getSnapshots } from "./fixtures/prismic-snapshots";
import { isFilledLinkToDocument } from "../src/helpers/type-guards";
import {
  createElasticBulkHelper,
  createElasticScrollDocuments,
} from "./fixtures/elastic";
import { prismicGet } from "./fixtures/prismic";
import { ETLEvents } from "../src/extractTransformLoadEvents";

describe("Extract, transform and load eventDocuments", () => {
  it("fetches eventDocuments from prismic and indexes them into ES", async () => {
    const allDocs = getSnapshots("events");

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

    await ETLEvents({ elastic: elasticClient, prismic: prismicClient }, {});

    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = getIndexedDocuments();
    expect(indexedDocs.map((doc) => doc.id)).toIncludeSameMembers(
      allDocs.map((doc) => doc.id)
    );
  });

  it("finds parent documents of updated children and re-fetches and indexes them", async () => {
    const eventFormats = getSnapshots("event-formats");
    // Any event which contains any of the `event-formats`
    const parentArticles = getSnapshots("events").filter((event) =>
      eventFormats.some(
        (eventFormat) =>
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

    await ETLEvents({ elastic: elasticClient, prismic: prismicClient }, {});

    const parentIds = parentArticles.map((doc) => doc.id);
    const prismicRequestedIds = prismicGetByIDs.mock.calls[0][0];
    expect(prismicRequestedIds).toIncludeSameMembers(parentIds);

    const finalIndexedDocuments = getIndexedDocuments();
    expect(finalIndexedDocuments.map((doc) => doc.id)).toIncludeSameMembers(
      parentIds
    );
  });
});
