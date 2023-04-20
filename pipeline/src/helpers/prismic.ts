import * as prismic from "@prismicio/client";
import { ContentType } from "../types";
import { TimeWindow } from "../event";

const graphQueryArticles = `{
    articles {
      title
      body {
        ...on text {
          non-repeat {
            text
          }
        }
        ...on standfirst {
          non-repeat {
            text
          }
        }
      }
      format {
        title
      }
      promo
      contributors {
        ...contributorsFields
        role {
          title
        }
        contributor {
          ... on people {
            name
          }
          ... on organisations {
            name
          }
        }
      }
    }
    webcomics {
      title
      format {
        title
      }
      promo
      contributors {
        ...contributorsFields
        role {
          title
        }
        contributor {
          ... on people {
            name
          }
          ... on organisations {
            name
          }
        }
      }
    }
  }`.replace(/\n(\s+)/g, "\n"); // Pre-emptive removal of whitespaces as requests to the Prismic Rest API are limited to 2048 characters.

type GetPrismicDocumentsParams = {
  contentTypes: ContentType[];
  publicationWindow: TimeWindow;
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

export const getPrismicDocuments = async <T>(
  client: prismic.Client,
  { contentTypes, publicationWindow, after }: GetPrismicDocumentsParams
): Promise<PrismicPage<T>> => {
  const startDate = publicationWindow.start;
  const endDate = publicationWindow.end;
  const docs = await client.get({
    graphQuery: graphQueryArticles,
    predicates: [
      prismic.predicate.any(fields.documentType, contentTypes),
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
    pageSize: 100,
    after,
  });

  const results = docs.results;
  const lastDoc = results[results.length - 1];
  const lastDocId = lastDoc?.id;

  return {
    docs: results as T[],
    lastDocId,
  };
};
