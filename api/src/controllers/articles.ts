import { RequestHandler } from "express";
import * as prismic from "@prismicio/client";
import asyncHandler from "express-async-handler";
import {
  ArticlePrismicDocument,
  Displayable,
  ElasticClients,
  Clients,
  ContentType,
  ResultList,
  Article,
} from "../types";
import { Config } from "../../config";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import {
  paginationElasticBody,
  PaginationQueryParameters,
  paginationResponseGetter,
} from "./pagination";
import { articlesContentTypes, graphQueryArticles } from "../helpers/articles";

type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<
  never,
  ResultList<Article>,
  never,
  QueryParams
>;

const articlesController = (
  clients: Clients | ElasticClients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticlesHandler => {
  if ("prismic" in clients) {
    return asyncHandler(async (req, res) => {
      try {
        const searchResponse = await clients.prismic.get<
          ArticlePrismicDocument & {
            contentType: ContentType | ContentType[];
          }
        >({
          graphQuery: graphQueryArticles,
          predicates: [
            prismic.predicate.any("document.type", articlesContentTypes),
          ],
        });
        if (searchResponse) {
          const transformedResponse = searchResponse.results.map((result) =>
            transformArticle(result)
          );

          res.status(200).json({
            type: "ResultList",
            results: transformedResponse,
            totalResults: searchResponse.total_results_size,
            totalPages: searchResponse.total_pages,
            pageSize: searchResponse.results_per_page, // TODO This should be customisable, not worth doing until we move to ES?
          });
        } else {
          throw new HttpError({
            status: 404,
            label: "No results found",
          });
        }
      } catch (error) {
        throw error;
      }
    });
  } else if ("elastic" in clients) {
    const index = config.contentsIndex;

    const getPaginationResponse = paginationResponseGetter(
      config.publicRootUrl
    );

    try {
      return asyncHandler(async (req, res) => {
        const queryString = req.query.query;
        const identifierTypeFilter = req.query["identifiers.identifierType"];

        const searchResponse = await clients.elastic.search<
          Displayable<Article>
        >({
          index,
          body: {
            ...paginationElasticBody(req.query),
            _source: ["display"],
            track_total_hits: true,
            query: {
              bool: {
                should: queryString
                  ? [
                      {
                        match: {
                          "query.identifiers.value": {
                            query: queryString,
                            analyzer: "whitespace",
                            operator: "OR",
                            boost: 1000,
                          },
                        },
                      },
                      {
                        multi_match: {
                          query: queryString,
                          fields: ["query.label", "query.alternativeLabels"],
                          type: "cross_fields",
                        },
                      },
                    ]
                  : [],
                filter: identifierTypeFilter
                  ? [
                      {
                        term: {
                          "query.identifiers.identifierType":
                            identifierTypeFilter,
                        },
                      },
                    ]
                  : [],
              },
            },
            sort: queryString ? ["_score"] : ["query.id"],
          },
        });

        const results = searchResponse.hits.hits.flatMap((hit) =>
          hit._source ? [hit._source.display] : []
        );

        const requestUrl = new URL(
          req.url,
          `${req.protocol}://${req.headers.host}`
        );
        const totalResults =
          typeof searchResponse.hits.total === "number"
            ? searchResponse.hits.total
            : searchResponse.hits.total?.value ?? 0;
        const paginationResponse = getPaginationResponse({
          requestUrl,
          totalResults,
        });
        res.status(200).json({
          type: "ResultList",
          results,
          ...paginationResponse,
        });
      });
    } catch (error) {
      // TODO add error checking once we get ES in
      throw error;
    }
  } else {
    // To remove when cleaning up Prismic v ES
    throw new HttpError({
      status: 500,
      label: "Internal Server Error",
    });
  }
};

export default articlesController;
