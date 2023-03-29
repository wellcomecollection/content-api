import * as prismic from "@prismicio/client";
import { ContentType } from "../types";

const graphQueryArticles = `{
    articles {
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

// TODO Review what prismic function we use here.
// getAllByType (no pagination blocker but only one type at a time)
// or getByType (which allows more than one type at a time).
// Review if predicates are still required
type GetPrismicDocumentsParams = {
  client: prismic.Client;
  contentTypes: ContentType[];
  after?: string;
};

export type PrismicPage<T> = {
  docs: T[];
  lastDocId?: string;
};

export const getPrismicDocuments = async <T>({
  client,
  contentTypes,
  after,
}: GetPrismicDocumentsParams): Promise<PrismicPage<T>> => {
  const docs = await client.getByType(contentTypes[0], {
    graphQuery: graphQueryArticles,
    predicates: [prismic.predicate.any("document.type", contentTypes)],
    orderings: {
      field: "document.last_publication_date",
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
