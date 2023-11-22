import type { Client as ElasticClient } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import { createHandler } from "../src/handler";
import { Context } from "aws-lambda";
import { ArticlePrismicDocument } from "../src/types/prismic";
import { getSnapshots } from "./fixtures/prismic-snapshots";
import { isFilledLinkToDocument } from "../src/helpers/type-guards";
import {
  createElasticBulkHelper,
  createElasticScrollDocuments,
} from "./fixtures/elastic";
import { prismicGet } from "./fixtures/prismic";

describe("handler", () => {
  it("fetches articles and webcomics from prismic and indexes them into ES", async () => {
    const allDocs = getSnapshots("articles", "webcomics");

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

    const testHandler = createHandler({
      elastic: elasticClient,
      prismic: prismicClient,
    });
    await testHandler({}, {} as Context, () => {});

    expect(elasticIndexCreator).toHaveBeenCalled();
    expect(elasticBulkHelper).toHaveBeenCalled();

    const indexedDocs = getIndexedDocuments();
    expect(indexedDocs.map((doc) => doc.id)).toIncludeSameMembers(
      allDocs.map((doc) => doc.id)
    );
  });

  it("finds parent documents of updated children and re-fetches and indexes them", async () => {
    const contributors = getSnapshots("people");
    // Any articles/webcomics which contain any of the `contributors`
    const parentArticles = getSnapshots<ArticlePrismicDocument>(
      "articles",
      "webcomics"
    ).filter((article) =>
      contributors.some((contributor) =>
        article.data.contributors.some(
          (articleContributor) =>
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

    const testHandler = createHandler({
      elastic: elasticClient,
      prismic: prismicClient,
    });
    await testHandler({}, {} as Context, () => {});

    const parentIds = parentArticles.map((doc) => doc.id);
    const prismicRequestedIds = prismicGetByIDs.mock.calls[0][0];
    expect(prismicRequestedIds).toIncludeSameMembers(parentIds);

    const finalIndexedDocuments = getIndexedDocuments();
    expect(finalIndexedDocuments.map((doc) => doc.id)).toIncludeSameMembers(
      parentIds
    );
  });
});
