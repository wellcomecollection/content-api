import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import { eventBridgePrismicEvent } from "../src/event";
import { createHandler } from "../src/handler";
import { Context } from "aws-lambda";

describe("content unpublisher", () => {
  it("deletes all the documents in the event from the index", async () => {
    const documents = ["test-1", "test-2"];
    const testIndex = "test-index";
    const event = eventBridgePrismicEvent(documents);
    const mockElasticClient = {
      delete: jest.fn().mockResolvedValue({}),
    };
    const testHandler = createHandler(
      { elastic: mockElasticClient as unknown as ElasticClient },
      { index: testIndex }
    );

    await testHandler(event, {} as Context, () => {});

    expect(mockElasticClient.delete).toHaveBeenCalledTimes(2);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.index)
    ).toSatisfyAll((idx) => idx === testIndex);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.id)
    ).toIncludeAllMembers(documents);
  });

  it("does not error if a document is not found", async () => {
    const event = eventBridgePrismicEvent(["test"]);
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          meta: {} as any,
          warnings: [],
          statusCode: 404,
        })
      ),
    };
    const testHandler = createHandler(
      { elastic: mockElasticClient as unknown as ElasticClient },
      { index: "test" }
    );

    return expect(testHandler(event, {} as Context, () => {})).resolves;
  });

  it("fails when Elasticsearch returns an unexpected error", async () => {
    const event = eventBridgePrismicEvent(["test"]);
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          meta: {} as any,
          warnings: [],
          statusCode: 400,
        })
      ),
    };
    const testHandler = createHandler(
      { elastic: mockElasticClient as unknown as ElasticClient },
      { index: "test" }
    );

    return expect(
      testHandler(event, {} as Context, () => {})
    ).rejects.toBeInstanceOf(elasticErrors.ResponseError);
  });
});
