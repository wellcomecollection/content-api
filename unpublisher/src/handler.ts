import { EventBridgeHandler } from "aws-lambda";
import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import log from "@weco/content-common/services/logging";
import { Result } from "@elastic/elasticsearch/lib/api/types";
import { WebhookBodyAPIUpdate } from "@prismicio/types";

type Clients = {
  elastic: ElasticClient;
};

type Config = {
  index: string;
};

export const createHandler =
  (
    clients: Clients,
    config: Config
  ): EventBridgeHandler<"document-unpublish", WebhookBodyAPIUpdate, void> =>
  async (event, context) => {
    // There is no way to tell from the payload whether the update is for unpublished
    // documents or published documents; we have to rely on having configured the
    // webhook correctly.
    // See https://prismic.io/docs/webhooks#a-document-is-unpublished
    const unpublishedDocuments = event.detail.documents;
    const deletedDocuments = Object.fromEntries<Result>(
      await Promise.all(
        unpublishedDocuments.map(async (id) => {
          try {
            const response = await clients.elastic.delete({
              index: config.index,
              id,
            });
            return [id, response.result] as const;
          } catch (e) {
            if (e instanceof elasticErrors.ResponseError) {
              if (e.statusCode === 404) {
                return [id, "not_found"] as const;
              }
            }
            throw e;
          }
        })
      )
    );
    log.info(`${Object.keys(deletedDocuments).length} deletions complete: `);
    log.info(JSON.stringify(deletedDocuments));
  };
