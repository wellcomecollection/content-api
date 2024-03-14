import type { Client as ElasticClient } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import { getSnapshots } from "./fixtures/prismic-snapshots";
import { createElasticBulkHelper } from "./fixtures/elastic";
import { prismicGetByType } from "./fixtures/prismic";
import { createETLByTypePipeline } from "../src/extractTransformLoadByType";
import { venueQuery } from "../src/graph-queries";
import { venues } from "../src/indices";
import { transformVenue } from "../src/transformers/venue";

describe("Extract, transform and load a specific prismic document type", () => {
  it("fetches document from prismic whose type matches, and indexes them into ES", async () => {
    const allDocs = getSnapshots("collection-venue");

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
      getAllByType: prismicGetByType(allDocs),
    } as unknown as prismic.Client;

    const venuePipeline = createETLByTypePipeline({
      indexConfig: venues,
      graphQuery: venueQuery,
      documentType: "collection-venue",
      transformer: transformVenue,
    });

    await venuePipeline(
      { elastic: elasticClient, prismic: prismicClient },
      { contentType: "venues" }
    );

    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = getIndexedDocuments();

    expect(indexedDocs.map((doc) => doc.id)).toIncludeSameMembers(
      allDocs.map((doc) => doc.id)
    );
  });
});
