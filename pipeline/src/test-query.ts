import { createPrismicClient } from "./services/prismic";
import * as prismic from "@prismicio/client";

const util = require("util");
import {
  wrapQueries,
  articlesQuery,
  webcomicsQuery,
  eventDocumentsQuery,
  venueQuery,
} from "./graph-queries";
import { transformArticle } from "./transformers/article";
import { transformEventDocument } from "./transformers/eventDocument";
import { transformVenue } from "./transformers/venue";
import {
  ArticlePrismicDocument,
  EventPrismicDocument,
  VenuePrismicDocument,
} from "./types/prismic";

const articleId = "ZfAhlhAAACYA2QVb";
const comicId = "ZGtGmRQAAHnPQ2-Z";
const eventWithScheduleId = "ZcDCOhAAAPpnKL4S";
const collectionVenueId = {
  galleries: "Wsttgx8AAJeSNmJ4",
  libraries: "WsuS_R8AACS1Nwlx",
  shop: "WsuaIB8AAH-yNylo",
  café: "WsuZKh8AAOG_NyUo",
  readingRoom: "Wvlk4yAAAB8A3ufp",
};

export const doTheThing = async () => {
  const client = createPrismicClient();

  // switch the graphQuery to suit the type of Prismic doc
  // of the id passed to client.getByID()
  const doc = await client.getByID(eventWithScheduleId, {
    // graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
    graphQuery: eventDocumentsQuery,
    // graphQuery: venueQuery
  });

  // consologs the Prismic doc

  console.log(
    util.inspect(doc, { showHidden: false, depth: null, colors: true })
  );

  // consologs the transformed document
  // use transformer and type that matches whichever type of Prismic doc you're fetching above

  // console.log(util.inspect(transformArticle(doc as ArticlePrismicDocument), { showHidden: false, depth: null, colors: true }))
  // console.log(util.inspect(transformEventDocument(doc as EventPrismicDocument), { showHidden: false, depth: null, colors: true }))
  // console.log(util.inspect(transformVenue(doc as VenuePrismicDocument), { showHidden: false, depth: null, colors: true }))
};

doTheThing();
