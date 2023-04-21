import { Handler } from "aws-lambda";
import { from, expand, mergeMap, map, EMPTY } from "rxjs";
import log from "@weco/content-common/services/logging";

import { ArticlePrismicDocument, Clients } from "./types";
import { transformArticle } from "./transformers/article";
import articlesQuery from "./graph-queries/articles";
import { ensureIndexExists, bulkIndexDocuments } from "./helpers/elasticsearch";
import { getPrismicDocuments } from "./helpers/prismic";
import { articles } from "./indices";
import { describeWindow, toBoundedWindow, WindowEvent } from "./event";

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    // 0. Create index if necessary
    await ensureIndexExists(clients.elastic, {
      index: articles.index,
      mappings: articles.mapping,
      settings: articles.settings,
    });

    // 1. Fetches everything from Prismic
    const window = toBoundedWindow(event);
    log.info(`Fetching articles last published ${describeWindow(window)}`);
    const getArticles = (after?: string) =>
      getPrismicDocuments<ArticlePrismicDocument>(clients.prismic, {
        graphQuery: articlesQuery,
        contentTypes: ["articles", "webcomics"],
        publicationWindow: toBoundedWindow(event),
        after,
      });

    // 2. Transforms each thing
    const articleObservable = from(getArticles()).pipe(
      expand((res) => (res.lastDocId ? getArticles(res.lastDocId) : EMPTY)),
      mergeMap((page) => page.docs),
      map(transformArticle)
    );

    // 3. Indexes all of them in ES
    const result = await bulkIndexDocuments(
      clients.elastic,
      articles.index,
      articleObservable
    );

    log.info(
      `Finished indexing documents; ${result.successful} successes and ${result.failed.length} failures in ${result.time}ms`
    );
  };
