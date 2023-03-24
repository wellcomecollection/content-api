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
export const getPrismicDocuments = async <T>({
  prismicClient,
  contentTypes,
}: {
  prismicClient: prismic.Client;
  contentTypes: ContentType[];
}): Promise<T> => {
  const getDocuments = await prismicClient.getByType(contentTypes[0], {
    graphQuery: graphQueryArticles,
    predicates: [prismic.predicate.any("document.type", contentTypes)],
  });

  return getDocuments.results as T;
};
