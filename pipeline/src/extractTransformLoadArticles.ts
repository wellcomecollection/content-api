import { articlesQuery, webcomicsQuery, wrapQueries } from "./graph-queries";
import { articles } from "./indices";
import { transformArticle } from "./transformers/article";
import { createETLPipeline } from "./extractTransformLoad";

export const ETLArticlesPipeline = createETLPipeline({
  graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
  indexConfig: articles,
  parentDocumentTypes: new Set(["articles", "webcomics"]),
  transformer: transformArticle,
});
