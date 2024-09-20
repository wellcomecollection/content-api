import { Handler } from "aws-lambda";

import { Clients } from "./types";
import { WindowEvent } from "./event";
import { createETLPipeline } from "./extractTransformLoad";
import {
  articlesQuery,
  webcomicsQuery,
  wrapQueries,
  eventDocumentsQuery,
  venueQuery,
} from "./graph-queries";
import { articles, events, venues } from "./indices";
import { transformArticle } from "./transformers/article";
import { transformEventDocument } from "./transformers/eventDocument";
import { transformVenue } from "./transformers/venue";

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

const loadVenues = createETLPipeline({
  graphQuery: venueQuery,
  indexConfig: venues,
  parentDocumentTypes: new Set(["collection-venue"]),
  transformer: transformVenue,
});

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event) => {
    if (!event.contentType) {
      throw new Error("Event contentType must be specified!");
    }
    if (event.contentType === "all" || event.contentType === "articles") {
      await loadArticles(clients, event);
    }
    if (event.contentType === "all" || event.contentType === "events") {
      await loadEvents(clients, event);
    }
    if (event.contentType === "all" || event.contentType === "venues") {
      await loadVenues(clients, event);
    }
  };
