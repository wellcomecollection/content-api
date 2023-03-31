import { Client } from "@elastic/elasticsearch";
import { Readable } from "stream";
import { articlesMapping, articlesSettings } from "../config/articles";

const indexName = "articles";

export const addIndex = async (elasticClient: Client) => {
  const exists = await elasticClient.indices.exists({ index: indexName });

  if (!exists) {
    await elasticClient.indices.create({
      index: indexName,
      mappings: articlesMapping,
      settings: articlesSettings,
    });
    console.log(indexName, "was created");
  } else {
    console.log("Index", indexName, "already exists");
  }
};

type HasIdentifier = {
  id: string;
};

export const bulkIndexDocuments = async <T extends HasIdentifier>(
  elasticClient: Client,
  datasource: Readable
) => {
  await elasticClient.helpers.bulk<T>({
    datasource,
    onDocument(doc) {
      return {
        index: { _index: indexName, _id: doc.id },
      };
    },
    onDrop(failureObject) {
      console.log(
        failureObject.document.id,
        "was dropped during the bulk import:",
        failureObject
      );
    },
  });

  return await elasticClient.count({ index: indexName });
};
