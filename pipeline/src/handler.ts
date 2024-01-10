import { Handler } from "aws-lambda";

import { Clients } from "./types";
import { WindowEvent } from "./event";
import { createETLPipeline } from "./extractTransformLoad";
import {
  articlesQuery,
  eventDocumentsQuery,
  webcomicsQuery,
  wrapQueries,
} from "./graph-queries";
import { articles, events } from "./indices";
import { transformArticle } from "./transformers/article";
import { transformEventDocument } from "./transformers/eventDocument";

const loadArticles = createETLPipeline({
  graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
  indexConfig: articles,
  parentDocumentTypes: new Set(["articles", "webcomics"]),
  transformer: transformArticle,
});

const loadEvents = createETLPipeline({
  graphQuery: eventDocumentsQuery,
  indexConfig: events,
  parentDocumentTypes: new Set(["events"]),
  transformer: transformEventDocument,
});

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    if (!event.contentType) {
      throw new Error("Event contentType must be specified!");
    }

    if (event.contentType === "all" || event.contentType === "articles") {
      await loadArticles(clients, event);
    }
    if (event.contentType === "all" || event.contentType === "events") {
      await loadEvents(clients, event);
    }
  };
