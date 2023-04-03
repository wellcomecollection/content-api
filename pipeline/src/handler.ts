import { Handler } from "aws-lambda";
import { from, expand, mergeMap, map, EMPTY } from "rxjs";
import { ArticlePrismicDocument, Clients } from "./types";
import { transformArticle } from "./transformers/article";
import { ensureIndexExists, bulkIndexDocuments } from "./helpers/elasticsearch";
import { getPrismicDocuments } from "./helpers/prismic";
import { articles } from "./indices";

type WindowEvent = {
  start?: Date;
  end?: Date;
};

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    try {
      // 0. Create index if necessary
      await ensureIndexExists(clients.elastic, {
        index: articles.index,
        mappings: articles.mapping,
        settings: articles.settings,
      });

      // 1. Fetches everything from Prismic
      // TODO between event.start and event.end
      const getArticles = (after?: string) =>
        getPrismicDocuments<ArticlePrismicDocument>({
          client: clients.prismic,
          contentTypes: ["articles", "webcomics"],
          after,
        });

      // 2. Transforms each thing
      const articleObservable = from(getArticles()).pipe(
        expand((res) => (res.lastDocId ? getArticles(res.lastDocId) : EMPTY)),
        mergeMap((page) => page.docs),
        map(transformArticle)
      );

      // // 3. Indexes all of them in ES
      const result = await bulkIndexDocuments(
        clients.elastic,
        articles.index,
        articleObservable
      );

      console.log(
        `Finished indexing documents; ${result.successful} successes and ${result.failed.length} failures in ${result.time}ms`
      );
    } catch (error) {
      // TODO handle this better, what would we want here?
      console.log({ error });
      throw error;
    }
  };
