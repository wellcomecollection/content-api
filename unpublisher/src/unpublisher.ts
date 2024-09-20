import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import log from "@weco/content-common/services/logging";
import { Result } from "@elastic/elasticsearch/lib/api/types";

type Clients = {
  elastic: ElasticClient;
};

export const createUnpublisher =
  (index: string) =>
  async (clients: Clients, unpublishedDocuments: string[]) => {
    // There is no way to tell from the payload whether the update is for unpublished
    // documents or published documents; we have to rely on having configured the
    // webhook correctly.
    // See https://prismic.io/docs/webhooks#a-document-is-unpublished
    const deletedDocuments = Object.fromEntries<Result>(
      await Promise.all(
        unpublishedDocuments.map(async (id) => {
          try {
            const response = await clients.elastic.delete({
              index,
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
        }),
      ),
    );
    log.info(`${Object.keys(deletedDocuments).length} deletions complete: `);
    log.info(JSON.stringify(deletedDocuments));
  };
