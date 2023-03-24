import { Client } from "@elastic/elasticsearch";

const indexName = "testing-index";

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
  docs: T[]
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
