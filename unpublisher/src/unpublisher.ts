import {
  Client as ElasticClient,
  errors as elasticErrors,
} from '@elastic/elasticsearch';
import { Result } from '@elastic/elasticsearch/lib/api/types';

import log from '@weco/content-common/services/logging';

type Clients = {
  elastic: ElasticClient;
};

// There is no way to tell from the payload whether the update is for unpublished
// documents or published documents; we have to rely on having configured the
// webhook correctly.
// See https://prismic.io/docs/webhooks#a-document-is-unpublished

export const createUnpublisher =
  (index: string) =>
  async (clients: Clients, unpublishedDocuments: string[]) => {
    const deletedDocuments = Object.fromEntries<Result>(
      await Promise.all(
        unpublishedDocuments.map(async id => {
          try {
            const response = await clients.elastic.delete({
              index,
              id,
            });
            return [id, response.result] as const;
          } catch (e) {
            if (e instanceof elasticErrors.ResponseError) {
              if (e.statusCode === 404) {
                return [id, 'not_found'] as const;
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

// For addressables, the Elasticsearch document IDs are modified (e.g., "id.type" or "id.type.audio/bsl" for highlight tours)
//  So we delete using deleteByQuery and query.prismicId
export const createAddressablesUnpublisher =
  (index: string) =>
  async (clients: Clients, unpublishedDocuments: string[]) => {
    const deletedDocuments = Object.fromEntries<Result | string>(
      await Promise.all(
        unpublishedDocuments.map(async prismicId => {
          try {
            const response = await clients.elastic.deleteByQuery({
              index,
              body: {
                query: {
                  term: {
                    'query.prismicId': prismicId,
                  },
                },
              },
            });

            const deletedCount = response.deleted || 0;

            if (deletedCount === 0) {
              return [prismicId, 'not_found'] as const;
            }

            return [prismicId, 'deleted'] as const;
          } catch (e) {
            if (e instanceof elasticErrors.ResponseError) {
              if (e.statusCode === 404) {
                return [prismicId, 'not_found'] as const;
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
