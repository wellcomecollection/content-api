import { Client } from "@elastic/elasticsearch";
import { CountResponse } from "@elastic/elasticsearch/lib/api/types";
import { getConfig } from "../../../api/config";
import { PaginationQueryParameters } from "../../../api/src/controllers/pagination";
import { RequestHandler } from "express";

const indexName = getConfig().contentsIndex;

type QueryParams = {
  query?: string;
} & PaginationQueryParameters;

export type Handler = RequestHandler<
  never,
  { count: CountResponse },
  never,
  QueryParams
>;

// TODO remove?
export const addIndex = async (elasticClient: Client, indexName: string) => {
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

export const bulkIndexDocuments = async (
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
