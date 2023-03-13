import { PrismicDocument, Query } from "@prismicio/types";
import * as prismic from "@prismicio/client";
import { isString } from "../helpers";

const graphQuery = `{
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
  }`.replace(/\n(\s+)/g, "\n");

type GetServerSidePropsPrismicClient = {
  type: "GetServerSidePropsPrismicClient";
  client: prismic.Client;
};

type GetByTypeParams = Parameters<
  GetServerSidePropsPrismicClient["client"]["getByType"]
>[1];

export function fetcher<Document extends PrismicDocument>(
  contentType: "articles" | "articles"[]
) {
  return {
    getById: async (
      { client }: GetServerSidePropsPrismicClient,
      id: string
    ): Promise<Document | undefined> => {
      try {
        // This means that Prismic will only return the document with the given ID if
        // it matches the content type.  So e.g. going to /events/<exhibition ID> will
        // return a 404, rather than a 500 as we find we're missing a bunch of fields
        // we need to render the page.
        const predicates = isString(contentType)
          ? [prismic.predicate.at("document.type", contentType)]
          : [prismic.predicate.any("document.type", contentType)];

        return await client.getByID<Document>(id, {
          predicates,
          graphQuery,
        });
      } catch {}
    },

    /** Get all the documents of a given type.
     *
     * If `contentType` is an array, this fetches all the documents of any specified type.
     * This is useful if we use the same fetch/transform method for multiple documents with
     * different types in Prismic, e.g. articles which could be 'article' or 'webcomic'.
     */
    getByType: async (
      { client }: GetServerSidePropsPrismicClient,
      params: GetByTypeParams = {}
    ): Promise<Query<Document>> => {
      const predicates = isString(params.predicates)
        ? [params.predicates]
        : Array.isArray(params.predicates)
        ? params.predicates
        : [];

      const response = isString(contentType)
        ? await client.getByType<Document>(contentType, {
            ...params,
            predicates,
            graphQuery,
          })
        : await client.get<Document>({
            ...params,
            graphQuery,
            predicates: [
              ...predicates,
              prismic.predicate.any("document.type", contentType),
            ],
          });

      return response;
    },
  };
}
