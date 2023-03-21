import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Displayable, Clients, ResultList, Article } from "../types";
import { Config } from "../../config";
import { HttpError } from "./error";
import {
  paginationElasticBody,
  PaginationQueryParameters,
  paginationResponseGetter,
} from "./pagination";

type QueryParams = {
  query?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<
  never,
  ResultList<Article>,
  never,
  QueryParams
>;

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.contentsIndex;

  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  try {
    return asyncHandler(async (req, res) => {
      const queryString = req.query.query;

      const searchResponse = await clients.elastic.search<Displayable<Article>>(
        {
          index,
          body: {
            ...paginationElasticBody(req.query),
            _source: ["display"],
            // TODO This can all be cleaned up later on - it's just to test basics.
            track_total_hits: true,
            query: {
              bool: {
                should: queryString
                  ? [
                      {
                        match: {
                          "display.title": {
                            query: queryString,
                            analyzer: "whitespace",
                            operator: "OR",
                            boost: 1000,
                          },
                        },
                      },
                    ]
                  : [],
              },
            },
          },
        }
      );

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
    // TODO handle this more constructively
    throw new HttpError({
      status: 500,
      label: "Internal Server Error",
    });
  }
};

export default articlesController;
