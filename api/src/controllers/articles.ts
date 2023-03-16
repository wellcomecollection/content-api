import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import {
  Clients,
  Displayable,
  ElasticClients,
  ResultList,
  TransformedArticle,
} from "../types";
import { Config } from "../../config";
import { articlesFetcher } from "./fetcher";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { paginationElasticBody, paginationResponseGetter } from "./pagination";

type PathParams = { contentType: string };

// TODO Unused now, but for when we add querying capabilities
type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string;
};

type ArticlesHandler = RequestHandler<
  PathParams,
  ResultList<TransformedArticle>,
  QueryParams
>;

type ArticlesHandlerElastic = RequestHandler<
  never,
  ResultList<TransformedArticle>,
  never,
  QueryParams
>;

const articlesController = (
  clients: Clients | ElasticClients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticlesHandler | ArticlesHandlerElastic => {
  if ("prismic" in clients) {
    return asyncHandler(async (req, res) => {
      try {
        const searchResponse = await articlesFetcher.getByType({
          type: "GetServerSidePropsPrismicClient",
          client: clients.prismic,
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
    const elasticClient = clients.elastic;

    const getPaginationResponse = paginationResponseGetter(
      config.publicRootUrl
    );

    try {
      return asyncHandler(async (req, res) => {
        const queryString = req.query.query;
        const identifierTypeFilter = req.query["identifiers.identifierType"];
        const searchResponse = await elasticClient.search<
          Displayable<TransformedArticle>
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
      throw error;
    }
  } else {
    throw new HttpError({
      status: 500,
      label: "To remove when cleaning up Prismic v ES",
    });
  }
};

export default articlesController;
