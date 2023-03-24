import { Handler } from "aws-lambda";
import { ArticlePrismicDocument, Clients } from "./types";
import { transformArticle } from "./transformers/article";
import { bulkIndexDocuments } from "./helpers/elasticsearch";
import { getPrismicDocuments } from "./helpers/prismic";

export const createHandler =
  (clients: Clients): Handler =>
  async (event, context) => {
    try {
      // Fetch all articles and webcomics from Prismic
      const searchResponse = await getPrismicDocuments<
        ArticlePrismicDocument[]
      >({
        prismicClient: clients.prismic,
        contentTypes: ["articles", "webcomics"],
      });

      if (searchResponse) {
        // Transform all articles and webcomics
        // As this is for testing, we don't need all 900 articles
        const transformedResponse = searchResponse.map((result) =>
          transformArticle(result)
        );

        // Bulk send them to Elasticsearch
        const count = await bulkIndexDocuments(
          clients.elastic,
          transformedResponse
        );

        console.log({ count });
        return count;
      }
    } catch (error) {
      // TODO handle this better, what would we want here?
      console.log({ error });
      throw error;
    }
  };
