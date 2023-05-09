import { Handler } from "aws-lambda";
import { mergeMap, map, partition, bufferCount, filter, tap } from "rxjs";
import log from "@weco/content-common/services/logging";

import { ArticlePrismicDocument, Clients } from "./types";
import { articlesQuery, webcomicsQuery, wrapQueries } from "./graph-queries";
import {
  ensureIndexExists,
  bulkIndexDocuments,
  getParentDocumentIDs,
} from "./helpers/elasticsearch";
import {
  getDocumentsByID,
  getPrismicDocuments,
  paginator,
} from "./helpers/prismic";
import { articles } from "./indices";
import { describeWindow, toBoundedWindow, WindowEvent } from "./event";
import { transformArticle, isArticle } from "./transformers/article";

const graphQuery = wrapQueries(articlesQuery, webcomicsQuery);

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    // 0. Create index if necessary
    await ensureIndexExists(clients.elastic, {
      index: articles.index,
      mappings: articles.mapping,
      settings: articles.settings,
    });

    // 1. Prepare queries to fetch everything from Prismic
    const window = toBoundedWindow(event);
    log.info(`Fetching documents last published ${describeWindow(window)}`);

    // 2. Fetch all documents published in the given window and partition them into
    // "parent" and "other" documents: those which we want to transform and those
    // which *may* have been denormalised onto the former.
    const [parentDocuments, otherDocuments] = partition(
      paginator((after?: string) =>
        getPrismicDocuments(clients.prismic, {
          publicationWindow: toBoundedWindow(event),
          graphQuery,
          after,
        })
      ),
      isArticle
    );

    // 3. Index all the parent documents into elasticsearch after transforming them
    // into our common schema
    const initialIndex = await bulkIndexDocuments(
      clients.elastic,
      articles.index,
      parentDocuments.pipe(map(transformArticle))
    );
    log.info(
      `Indexed ${initialIndex.successfulIds.size} parent documents in ${initialIndex.time}ms`
    );

    // 3. Find parent documents which were not changed but have child documents that
    // were changed
    const nextParentDocuments = otherDocuments.pipe(
      map((doc) => doc.id),
      // Query elasticsearch for (parent) documents that contain these child document IDs
      // The field name is mapped in `indices/articles.ts` and populated by the transformer
      getParentDocumentIDs(clients.elastic, {
        index: articles.index,
        identifiersField: "query.linkedIdentifiers",
      }),
      // We don't need to update parent documents that we already got in this window
      // as they were updated above
      filter((parentId) => !initialIndex.successfulIds.has(parentId)),
      // Fetch the latest version of all the parent documents
      getDocumentsByID<ArticlePrismicDocument>(clients.prismic, { graphQuery })
    );

    const nextIndex = await bulkIndexDocuments(
      clients.elastic,
      articles.index,
      nextParentDocuments.pipe(map(transformArticle))
    );
    log.info(
      `Indexed a further ${nextIndex.successfulIds.size} documents in ${nextIndex.time}ms that contained child documents which had been updated`
    );
  };
