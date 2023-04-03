import { Handler } from "aws-lambda";
import { Article, ArticlePrismicDocument, Clients } from "./types";
import { transformArticle } from "./transformers/article";
import { bulkIndexDocuments } from "./helpers/elasticsearch";
import { getPrismicDocuments } from "./helpers/prismic";
import { from, expand, mergeMap, map, EMPTY } from "rxjs";
import { observableToStream } from "./helpers/observableToStream";

type WindowEvent = {
  start?: Date;
  end?: Date;
};

const toIndexedDocument = (article: Article) => ({
  id: article.id,
  display: article,
  query: { id: article.id },
});

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    // 0. Create index if necessary
    // 1. Fetches everything from Prismic between event.start and event.end
    // 2. Transforms each thing
    // 3. Indexes all of them in ES
    try {
      const getArticles = (after?: string) =>
        getPrismicDocuments<ArticlePrismicDocument>({
          client: clients.prismic,
          contentTypes: ["articles", "webcomics"],
          after,
        });
      // Fetch all articles and webcomics from Prismic
      const articleObservable = from(getArticles()).pipe(
        expand((res) => (res.lastDocId ? getArticles(res.lastDocId) : EMPTY)),
        mergeMap((page) => page.docs),
        map(transformArticle),
        map(toIndexedDocument)
      );

      // Bulk send them to Elasticsearch
      const count = await bulkIndexDocuments(
        clients.elastic,
        observableToStream(articleObservable)
      );

      console.log({ count });
      return count;
    } catch (error) {
      // TODO handle this better, what would we want here?
      console.log({ error });
      throw error;
    }
  };
