import { PrismicDocument, Query } from "@prismicio/types";
import * as prismic from "@prismicio/client";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import {
  ArticlePrismicDocument,
  Clients,
  ResultList,
  TransformedArticle,
} from "../types";
import { Config } from "../../config";
import { transformArticles } from "../transformers/articles";
import { isString } from "../helpers";

type PathParams = { contentType: string };

type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string; // TODO ?
};

type ContentListHandler = RequestHandler<
  PathParams,
  ResultList<TransformedArticle>,
  QueryParams
>;

// TODO figure out how to get the metadata
const graphQuery = `{
  articles {
    title
    format {
      ...formatFields
    }
    promo
    contributors {
      ...contributorsFields
      role {
        ...roleFields
      }
      contributor {
        ... on people {
          ...peopleFields
        }
        ... on organisations {
          ...organisationsFields
        }
      }
    }
  }
}`.replace(/\n(\s+)/g, "\n");

export type GetServerSidePropsPrismicClient = {
  type: "GetServerSidePropsPrismicClient";
  client: prismic.Client;
};
export type GetByTypeParams = Parameters<
  GetServerSidePropsPrismicClient["client"]["getByType"]
>[1];

// TODO figure out if fetchLinks are useful here? Isn't not all done with GraphQuery?
const articlesFetcher = fetcher<ArticlePrismicDocument>(
  ["articles"],
  ["article-formats.id"]
);

export function fetcher<Document extends PrismicDocument>(
  contentType: "articles" | "articles"[],
  fetchLinks: string[]
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
          fetchLinks,
          predicates,
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
            fetchLinks,
            predicates,
          })
        : await client.get<Document>({
            ...params,
            fetchLinks,
            predicates: [
              ...predicates,
              prismic.predicate.any("document.type", contentType),
            ],
          });

      return response;
    },
  };
}

const articlesController = (
  clients: Clients,
  config: Config // TODO ?
): ContentListHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    try {
      const searchResponse = await articlesFetcher.getByType(
        { type: "GetServerSidePropsPrismicClient", client: prismicClient },
        {
          graphQuery,
        }
      );

      const transformedResponse = transformArticles(searchResponse.results);

      res.status(200).json({
        type: "ResultList",
        results: transformedResponse,
      });
    } catch (error) {
      throw error;
    }
  });
};

export default articlesController;
