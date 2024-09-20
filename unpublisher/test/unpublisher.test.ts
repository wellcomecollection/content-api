import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import { createUnpublisher } from "../src/unpublisher";

const testIndex = "test-index";
const documents = ["test-1", "test-2"];

describe("content unpublisher", () => {
  it("deletes all the documents in the event from the index", async () => {
    const mockElasticClient = {
      delete: jest.fn().mockResolvedValue({}),
    };

    const testUnpublisher = createUnpublisher(testIndex);

    await testUnpublisher(
      { elastic: mockElasticClient as unknown as ElasticClient },
      documents,
    );

    expect(mockElasticClient.delete).toHaveBeenCalledTimes(2);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.index),
    ).toSatisfyAll((idx) => idx === testIndex);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.id),
    ).toIncludeAllMembers(documents);
  });

  it("does not error if a document is not found", async () => {
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 404,
        }),
      ),
    };

    const testUnpublisher = createUnpublisher(testIndex);

    return expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        documents,
      ),
    ).resolves;
  });

  it("fails when Elasticsearch returns an unexpected error", async () => {
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 400,
        }),
      ),
    };
    const testUnpublisher = createUnpublisher(testIndex);

    return expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        documents,
      ),
    ).rejects.toBeInstanceOf(elasticErrors.ResponseError);
  });
});
