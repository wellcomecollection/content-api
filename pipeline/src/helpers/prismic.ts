import * as prismic from "@prismicio/client";
import { PrismicDocument } from "@prismicio/types";
import { TimeWindow } from "../event";
import { concatMap, EMPTY, expand, from } from "rxjs";

// https://prismic.io/docs/technical-reference/prismicio-client#params-object
export const PRISMIC_MAX_PAGE_SIZE = 100;

type GetPrismicDocumentsParams = {
  publicationWindow: TimeWindow;
  graphQuery?: string;
  after?: string;
};

export type PrismicPage<T> = {
  docs: T[];
  lastDocId?: string;
};

const fields = {
  documentType: "document.type",
  lastPublicationDate: "document.last_publication_date",
} as const;

export const getPrismicDocuments = async (
  client: prismic.Client,
  { publicationWindow, graphQuery, after }: GetPrismicDocumentsParams
): Promise<PrismicPage<PrismicDocument>> => {
  const startDate = publicationWindow.start;
  const endDate = publicationWindow.end;
  const docs = await client.get({
    // Pre-emptive removal of whitespace as requests to the Prismic Rest API are limited to 2048 characters
    graphQuery: graphQuery?.replace(/\n(\s+)/g, "\n"),
    predicates: [
      startDate
        ? prismic.predicate.dateAfter(fields.lastPublicationDate, startDate)
        : [],
      endDate
        ? prismic.predicate.dateBefore(fields.lastPublicationDate, endDate)
        : [],
    ].flat(),
    orderings: {
      field: fields.lastPublicationDate,
      direction: "desc",
    },
    pageSize: PRISMIC_MAX_PAGE_SIZE,
    after,
  });

  const results = docs.results;
  const lastDoc = results[results.length - 1];
  const lastDocId = lastDoc?.id;

  return {
    docs: results,
    lastDocId,
  };
};

export const paginator = <T extends PrismicDocument>(
  nextPage: (after?: string) => Promise<PrismicPage<T>>
) =>
  from(nextPage()).pipe(
    expand((res) => (res.lastDocId ? nextPage(res.lastDocId) : EMPTY)),
    concatMap((page) => page.docs)
  );
