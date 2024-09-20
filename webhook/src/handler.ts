import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { response } from "./responses";
import {
  isPrismicApiUpdate,
  isPrismicWebhookPayload,
  wecoPrismicTrigger,
} from "./requests";
import log from "@weco/content-common/services/logging";

type Clients = {
  eventBridge: EventBridgeClient;
};

type Config = {
  secret: string;
  eventBusName: string;
  trigger?: string;
};

export const createHandler =
  (clients: Clients, config: Config): APIGatewayProxyHandlerV2 =>
  async (event) => {
    if (event.requestContext.http.method !== "POST") {
      return response({
        status: 405,
        label: "Method Not Allowed",
      });
    }

    const webhook = JSON.parse(event.body ?? "{}");
    if (!isPrismicWebhookPayload(webhook)) {
      return response({
        status: 400,
        label: "Bad Request",
        description: "Request body must be a valid Prismic webhook payload",
      });
    }

    if (config.trigger && wecoPrismicTrigger(event) !== config.trigger) {
      return response({
        status: 400,
        label: "Bad Request",
        description:
          "Custom header indicating webhook trigger is not acceptable",
      });
    }

    if (!webhook.secret) {
      return response({
        status: 401,
        label: "Unauthorized",
      });
    }

    if (webhook.secret !== config.secret) {
      return response({
        status: 403,
        label: "Forbidden",
      });
    }

    // If we expunge this now we don't accidentally log it and consumers don't find out about it
    webhook.secret = "<sensitive>";

    if (!isPrismicApiUpdate(webhook)) {
      log.info("Test webhook: ");
      log.info(JSON.stringify(webhook));
      return response({
        status: 200,
        label: "OK",
        description: "Test payload received",
      });
    }

    const publishResult = await clients.eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(webhook),
            DetailType: wecoPrismicTrigger(event) ?? webhook.type,
            EventBusName: config.eventBusName,
            Resources: [],
            Source: "prismic-webhook",
          },
        ],
      }),
    );

    if (publishResult.FailedEntryCount !== 0) {
      return response({
        status: Number(publishResult.Entries?.[0]?.ErrorCode ?? 500),
        label: "Publish Failed",
        description: publishResult.Entries?.[0].ErrorMessage ?? "Unknown Error",
      });
    }

    return response({
      status: 202,
      label: "Accepted",
      description: "Webhook payload was accepted",
    });
  };
