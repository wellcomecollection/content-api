import { Handler } from "aws-lambda";
import { ArticlePrismicDocument, Clients } from "./types";
import { transformArticle } from "./transformers/article";
import { addIndex, bulkIndexDocuments } from "./helpers/elasticsearch";
import { getPrismicDocuments } from "./helpers/prismic";
import { from, expand, mergeMap, map, EMPTY } from "rxjs";
import { observableToStream } from "./helpers/observableToStream";

type WindowEvent = {
  start?: Date;
  end?: Date;
};

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    try {
      // 0. Create index if necessary
      await addIndex(clients.elastic);

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
      const count = await bulkIndexDocuments(
        clients.elastic,
        observableToStream(articleObservable)
      );

      // on first creation of the index, the number returned isn't relevant and tends to be way lower
      // than the actual result.
      // once created though, it does return the correct amount of indexed articles.
      console.log({ count });
      return count;
    } catch (error) {
      // TODO handle this better, what would we want here?
      console.log({ error });
      throw error;
    }
  };
