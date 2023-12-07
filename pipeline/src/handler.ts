import { Handler } from "aws-lambda";
import { map, partition, filter, tap, concat } from "rxjs";
import log from "@weco/content-common/services/logging";

import { Clients } from "./types";
import { ArticlePrismicDocument } from "./types/prismic";
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
    // We also tap the observable to keep track of documents that we've seen, so as
    // to reduce duplicate work later on.
    const seenIds = new Set<string>();
    const [initialParentDocuments, otherDocuments] = partition(
      paginator((after?: string) =>
        getPrismicDocuments(clients.prismic, {
          publicationWindow: toBoundedWindow(event),
          graphQuery,
          after,
        })
      ).pipe(tap((document) => seenIds.add(document.id))),
      isArticle
    );

    // 3. Find parent documents which were not changed but have child documents that
    // were changed
    let parentsWithUpdatedChildren = 0;
    const remainingParentDocuments = otherDocuments.pipe(
      // Query elasticsearch for (parent) documents that contain these child document IDs
      // The field name is mapped in `indices/articles.ts` and populated by the transformer
      getParentDocumentIDs(clients.elastic, {
        index: articles.index,
        identifiersField: "query.linkedIdentifiers",
      }),
      // We don't need to update parent documents that we already got in this window
      // as their latest version was fetched above
      filter((parentId) => !seenIds.has(parentId)),
      // Fetch the latest version of all the parent documents including the denormalised data
      // from the child document: while we do have all the information for both the parent (from ES)
      // and the child (from the initial Prismic query), we don't want to have to know how to
      // combine it: the graphQuery holds all of that information.
      getDocumentsByID<ArticlePrismicDocument>(clients.prismic, { graphQuery }),
      tap(() => {
        parentsWithUpdatedChildren += 1;
      })
    );

    const nextIndex = await bulkIndexDocuments(
      clients.elastic,
      articles.index,
      concat(initialParentDocuments, remainingParentDocuments).pipe(
        map(transformArticle)
      )
    );
    log.info(
      `Indexed ${nextIndex.successfulIds.size} documents in ${nextIndex.time}ms (${parentsWithUpdatedChildren} had updates from linked documents)`
    );
  };
