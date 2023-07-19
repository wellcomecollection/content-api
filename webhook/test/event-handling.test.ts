import type { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { createHandler } from "../src/handler";
import { mockEvent, MockEventConfig, mockWebhook } from "./mock-event";
import { APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";

describe("Event handling", () => {
  const testEventBridgeClient = {
    send: jest.fn().mockResolvedValue({ FailedEntryCount: 0 }),
  } as unknown as EventBridgeClient;
  const testConfig = {
    secret: "test-secret",
    eventBusName: "test-bus",
    trigger: "test-trigger",
  };
  const testHandler = createHandler(
    { eventBridge: testEventBridgeClient },
    testConfig
  );

  const status = async (
    event: MockEventConfig
  ): Promise<number | undefined> => {
    const result = (await testHandler(
      mockEvent(event),
      {} as Context,
      () => {}
    )) as unknown as APIGatewayProxyStructuredResultV2;
    return result.statusCode;
  };

  it("Rejects non-POST requests", async () => {
    expect(await status({ method: "GET" })).toBe(405);
  });

  it("Rejects requests with a body that is not a valid Prismic webhook type", async () => {
    expect(await status({ method: "POST", body: "beep-boop" })).toBe(400);
  });

  it("Rejects requests that don't contain a header specifying their trigger", async () => {
    expect(
      await status({
        method: "POST",
        webhook: mockWebhook(),
      })
    ).toBe(400);
  });

  it("Rejects requests without a secret", async () => {
    expect(
      await status({
        method: "POST",
        webhook: mockWebhook(),
        headers: { "x-weco-prismic-trigger": testConfig.trigger },
      })
    ).toBe(401);
  });

  it("Rejects requests with an invalid secret", async () => {
    expect(
      await status({
        method: "POST",
        webhook: mockWebhook({ secret: "wrong-secret" }),
        headers: { "x-weco-prismic-trigger": testConfig.trigger },
      })
    ).toBe(403);
  });

  it("Accepts test webhook requests", async () => {
    expect(
      await status({
        method: "POST",
        webhook: mockWebhook({
          secret: testConfig.secret,
          type: "test-trigger",
        }),
        headers: { "x-weco-prismic-trigger": testConfig.trigger },
      })
    ).toBe(200);
  });

  it("Accepts API update webhook requests", async () => {
    expect(
      await status({
        method: "POST",
        webhook: mockWebhook({
          secret: testConfig.secret,
          type: "api-update",
        }),
        headers: { "x-weco-prismic-trigger": testConfig.trigger },
      })
    ).toBe(202);
  });

  it("Publishes API update webhook requests to EventBridge", async () => {
    const webhook = mockWebhook({
      secret: testConfig.secret,
      type: "api-update",
    });
    expect(
      await status({
        method: "POST",
        headers: { "x-weco-prismic-trigger": testConfig.trigger },
        webhook,
      })
    ).toBe(202);

    const lastCall = (testEventBridgeClient.send as jest.Mock).mock.lastCall[0];
    expect(lastCall.input.Entries[0].EventBusName).toEqual(
      testConfig.eventBusName
    );
    expect(lastCall.input.Entries[0].DetailType).toBe(testConfig.trigger);
    expect(JSON.parse(lastCall.input.Entries[0].Detail)).toEqual({
      ...webhook,
      secret: "<sensitive>",
    });
  });
});
