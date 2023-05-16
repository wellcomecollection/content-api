import { BulkHelperOptions } from "@elastic/elasticsearch/lib/helpers";
import { Readable } from "node:stream";

export const createElasticBulkHelper = (): [
  jest.Mock<Promise<{ time: number; successful: number }>, [BulkHelperOptions]>,
  () => any[]
] => {
  const indexedDocuments: any[] = [];
  const mock = jest.fn(async (params: BulkHelperOptions) => {
    // We have to consume the Readable here, which means it can't be read again,
    // so we store its contents in case we need to look at what we wanted to index
    // later on
    for await (const doc of params.datasource as Readable) {
      params.onDocument(doc);
      indexedDocuments.push(doc);
    }

    return {
      successful: indexedDocuments.length,
      time: 1234,
    };
  });
  const getIndexedDocuments = () => indexedDocuments;

  return [mock, getIndexedDocuments];
};

export const createElasticScrollDocuments = <T extends { id: string }>(
  docs: T[]
): jest.Mock<AsyncGenerator<T, void>> =>
  jest.fn(async function* () {
    for (const doc of docs) {
      yield doc;
    }
  });
