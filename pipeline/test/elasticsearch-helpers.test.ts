import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import { ensureIndexExists } from "../src/helpers/elasticsearch";

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
