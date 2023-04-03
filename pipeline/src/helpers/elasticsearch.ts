import { Client } from "@elastic/elasticsearch";
import { Readable } from "stream";

const indexName = "articles";

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
  });

  return await elasticClient.count({ index: indexName });
};
