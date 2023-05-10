import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import { lastValueFrom, range, map } from "rxjs";
import {
  ensureIndexExists,
  getParentDocumentIDs,
} from "../src/helpers/elasticsearch";
import { identifiedDocuments } from "./fixtures/generators";
import { createElasticScrollDocuments } from "./fixtures/elastic";

describe("ensureIndexExists", () => {
  it("creates an index", async () => {
    const createIndex = jest.fn().mockResolvedValue(true);
    const client = {
      indices: {
        create: createIndex,
      },
    } as unknown as ElasticClient;

    await ensureIndexExists(client, { index: "test" });
    expect(createIndex).toHaveBeenCalledOnceWith({ index: "test" });
  });

  it("updates the mapping if the index already exists", async () => {
    const createIndex = jest.fn().mockRejectedValue(
      new elasticErrors.ResponseError({
        statusCode: 400,
        body: {
          type: "resource_already_exists_exception",
        },
        warnings: [],
        meta: {} as any,
      })
    );
    const putMapping = jest.fn().mockResolvedValue(true);
    const client = {
      indices: {
        create: createIndex,
        putMapping,
      },
    } as unknown as ElasticClient;

    const testMapping = { properties: { field: { type: "keyword" } } } as const;
    await ensureIndexExists(client, {
      index: "test",
      mappings: testMapping,
    });

    expect(createIndex).toHaveBeenCalledOnceWith({
      index: "test",
      mappings: testMapping,
    });
    expect(putMapping).toHaveBeenCalledOnceWith({
      index: "test",
      ...testMapping,
    });
  });
});

describe("getParentDocumentIDs", () => {
  it("queries for batches of potential child document IDs", async () => {
    const totalDocs = 100;
    const batchSize = 10;

    const documents = identifiedDocuments(totalDocs);
    const elasticScrollDocuments = createElasticScrollDocuments(documents);
    const testClient = {
      helpers: {
        scrollDocuments: elasticScrollDocuments,
      },
    } as unknown as ElasticClient;

    const finalDoc = await lastValueFrom(
      range(totalDocs).pipe(
        map((n) => n.toString()),
        getParentDocumentIDs(testClient, {
          index: "test",
          identifiersField: "childIds",
          batchSize: batchSize,
        })
      )
    );

    expect(elasticScrollDocuments).toHaveBeenCalledTimes(totalDocs / batchSize);
    expect(finalDoc).toBe(totalDocs.toString());
  });
});
