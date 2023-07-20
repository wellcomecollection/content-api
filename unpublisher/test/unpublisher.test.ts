import { Client as ElasticClient } from "@elastic/elasticsearch";
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
});
