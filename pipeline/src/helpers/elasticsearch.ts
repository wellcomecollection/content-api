import { Client } from "@elastic/elasticsearch";
import { Readable } from "stream";

const indexName = "articles";

export const addIndex = async (elasticClient: Client) => {
  const exists = await elasticClient.indices.exists({ index: indexName });

  if (!exists) {
    await elasticClient.indices.create({
      index: indexName,
      mappings: {
        dynamic: "strict",
        properties: {
          id: {
            type: "text",
          },
          display: {
            type: "object",
            enabled: false,
          },
          query: {
            properties: {
              title: {
                type: "text",
              },
              published: {
                type: "date",
                format: "date_optional_time",
              },
              contributors: {
                type: "text",
              },
              caption: {
                type: "text",
              },
            },
          },
        },
      },
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
    onDrop(fail) {
      console.log(fail);
    },
  });

  return await elasticClient.count({ index: indexName });
};
