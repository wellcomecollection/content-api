import { Client } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import {
  Article,
  ArticlePrismicDocument,
  Clients,
  ContentType,
} from "../types";
import { CountResponse } from "@elastic/elasticsearch/lib/api/types";
import { getConfig } from "../../config";
import { graphQueryArticles } from "../helpers/articles";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { PaginationQueryParameters } from "./pagination";
import { RequestHandler } from "express";
import { PrismicDocument } from "@prismicio/types";

const indexName = getConfig().contentsIndex;

type QueryParams = {
  query?: string;
} & PaginationQueryParameters;

type Handler = RequestHandler<
  never,
  { count: CountResponse },
  never,
  QueryParams
>;

// TODO remove?
const addIndex = async (elasticClient: Client, indexName: string) => {
  const exists = await elasticClient.indices.exists({ index: indexName });

  if (!exists) {
    await elasticClient.indices.create({ index: indexName });
    console.log(indexName, "was created");
  } else {
    console.log("Index", indexName, "already exists");
  }
};

type TransformedDocument = {
  id: string;
};

const bulkIndexDocuments = async (
  elasticClient: Client,
  docs: TransformedDocument[]
) => {
  const datasource = docs.map((doc) => {
    return {
      display: doc,
      query: { id: doc.id },
    };
  });

  await elasticClient.helpers.bulk({
    datasource,
    onDocument(doc) {
      return {
        index: { _index: indexName, _id: doc.display.id },
      };
    },
  });

  return await elasticClient.count({ index: indexName });
};

// Review what prismic function we use here.
// getAllByType (no pagination blocker but only one type at a time)
// or getByType (which allows more than one type at a time).
// Review if predicates are still required
const getPrismicDocuments = async <T>({
  prismicClient,
  contentTypes,
}: {
  prismicClient: prismic.Client;
  contentTypes: ContentType[];
}): Promise<T> => {
  const getDocuments = await prismicClient.getAllByType(contentTypes[0], {
    graphQuery: graphQueryArticles,
    predicates: [prismic.predicate.any("document.type", contentTypes)],
  });

  return getDocuments as T;
};

const elasticsearchController = (clients: Clients): Handler => {
  return async (req, res) => {
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
        const transformedResponse = searchResponse
          .slice(0, 40)
          .map((result) => transformArticle(result));

        // Bulk send them to Elasticsearch
        const bulkHelper = await bulkIndexDocuments(
          clients.elastic,
          transformedResponse
        );

        res.status(200).json({ count: bulkHelper });
      } else {
        throw new HttpError({
          status: 404,
          label: "No results found",
        });
      }
    } catch (error) {
      // TODO handle this better, what would we want here?
      console.log({ error });
      throw error;
    }
  };
};

export default elasticsearchController;
