import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import log from "@weco/content-common/services/logging";
import { response } from "./responses";
import { isPrismicApiUpdate, isPrismicWebhookPayload } from "./requests";
import { Result } from "@elastic/elasticsearch/lib/api/types";

type Clients = {
  elastic: ElasticClient;
};

type Config = {
  secret: string;
  index: string;
};

export const createHandler =
  (clients: Clients, config: Config): APIGatewayProxyHandlerV2 =>
  async (event, context) => {
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

    if (webhook.secret === undefined) {
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

    if (!isPrismicApiUpdate(webhook)) {
      log.info("Test webhook: ");
      log.info(JSON.stringify(webhook));
      return response({
        status: 200,
        label: "OK",
        description: "Test payload received",
      });
    }

    // There is no way to tell from the payload whether the update is for unpublished
    // documents or published documents; we have to rely on having configured the
    // webhook correctly.
    // See https://prismic.io/docs/webhooks#a-document-is-unpublished
    const unpublishedDocuments = webhook.documents;
    const deletedDocuments = Object.fromEntries<Result>(
      await Promise.all(
        unpublishedDocuments.map(async (id) => {
          const response = await clients.elastic.delete({
            index: config.index,
            id,
          });
          return [id, response.result] as const;
        })
      )
    );
    log.info("Deletions complete: ");
    log.info(JSON.stringify(deletedDocuments));

    return response({
      status: 200,
      label: "OK",
      description: `Deleted ${unpublishedDocuments.length} unpublished documents from the index.`,
    });
  };
