import * as prismic from '@prismicio/client';
import {
  bufferCount,
  concatMap,
  EMPTY,
  expand,
  from,
  mergeMap,
  Observable,
  OperatorFunction,
  pipe,
} from 'rxjs';

import { TimeWindow } from '@weco/content-pipeline/src/event';

// https://prismic.io/docs/technical-reference/prismicio-client#params-object
const PRISMIC_MAX_PAGE_SIZE = 100;

type GetPrismicDocumentsParams = {
  publicationWindow: TimeWindow;
  graphQuery: string;
  filters?: string[];
  after?: string;
};

export type PrismicPage<T> = {
  docs: T[];
  lastDocId?: string;
};

const fields = {
  documentType: 'document.type',
  lastPublicationDate: 'document.last_publication_date',
} as const;

export const getPrismicDocuments = async (
  client: prismic.Client,
  { publicationWindow, graphQuery, after, filters }: GetPrismicDocumentsParams
): Promise<PrismicPage<prismic.PrismicDocument>> => {
  const startDate = publicationWindow.start;
  const endDate = publicationWindow.end;
  const docs = await client.get({
    // Pre-emptive removal of whitespace as requests to the Prismic Rest API are limited to 2048 characters
    graphQuery: graphQuery.replace(/\n(\s+)/g, '\n'),
    filters: [
      startDate
        ? prismic.filter.dateAfter(fields.lastPublicationDate, startDate)
        : [],
      endDate
        ? prismic.filter.dateBefore(fields.lastPublicationDate, endDate)
        : [],
    ]
      .concat(filters ?? [])
      .flat(),
    orderings: {
      field: fields.lastPublicationDate,
      direction: 'desc',
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

export const paginator = <T extends prismic.PrismicDocument>(
  nextPage: (after?: string) => Promise<PrismicPage<T>>
): Observable<T> =>
  from(nextPage()).pipe(
    expand(res => (res.lastDocId ? nextPage(res.lastDocId) : EMPTY)),
    concatMap(page => page.docs)
  );

export const getDocumentsByID = <T extends prismic.PrismicDocument>(
  client: prismic.Client,
  { graphQuery }: { graphQuery?: string } = {}
): OperatorFunction<string, T> =>
  pipe(
    bufferCount(PRISMIC_MAX_PAGE_SIZE),
    mergeMap(ids =>
      client.getByIDs<T>(ids, {
        graphQuery,
      })
    ),
    mergeMap(query => query.results)
  );
