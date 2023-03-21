import { Client } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import {
  Article,
  ArticlePrismicDocument,
  Clients,
  ContentType,
} from "../types";
import {
  CountResponse,
  ErrorCause,
} from "@elastic/elasticsearch/lib/api/types";
import { Config, getConfig } from "../../config";
import { articlesContentTypes, graphQueryArticles } from "../helpers/articles";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { PaginationQueryParameters } from "./pagination";
import { RequestHandler } from "express";

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

const useBulkHelper = async (elasticClient: Client, docs: Article[]) => {
  const operations = docs.flatMap((doc) => {
    return [
      { index: { _index: indexName, _id: doc.id } },
      {
        display: doc as Article,
        query: { id: doc.id },
      },
    ];
  });

  const bulkResponse = await elasticClient.bulk({ refresh: true, operations });

  if (bulkResponse.errors) {
    const erroredDocuments: {
      status: number;
      error: ErrorCause;
      operation: any;
      document: any;
    }[] = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      if (action["index"]?.error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action["index"]?.status,
          error: action["index"]?.error,
          operation: operations[i * 2],
          document: operations[i * 2 + 1],
        });
      }
    });
    console.log("erroredDocuments", erroredDocuments);
  }

  const count = await elasticClient.count({ index: indexName });
  return count;
};

const elasticSearchController = (clients: Clients, config: Config): Handler => {
  return async (req, res) => {
    try {
      const searchResponse = await clients.prismic.getAllByType<
        ArticlePrismicDocument & {
          contentType: ContentType | ContentType[];
        }
      >("articles", {
        // We'll need to consider "webcomics" as well when we do this properly
        graphQuery: graphQueryArticles,
        predicates: [
          prismic.predicate.any("document.type", articlesContentTypes),
        ],
      });

      if (searchResponse) {
        // As this is for testing, we don't need all 900 articles
        const transformedResponse = searchResponse
          .slice(0, 40)
          .map((result) => transformArticle(result));

        // // Send to ES
        const bulkHelper = await useBulkHelper(
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

export default elasticSearchController;
