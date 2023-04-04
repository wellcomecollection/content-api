import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable, ResultList } from "../types";
import { Config } from "../../config";
import { HttpError } from "./error";
import {
  paginationElasticBody,
  PaginationQueryParameters,
  paginationResponseGetter,
} from "./pagination";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const articlesSortValues = ["publication.date"];

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.contentsIndex;

  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  try {
    return asyncHandler(async (req, res) => {
      const { query: queryString, sort: sortBy, sortOrder } = req.query;
      const hasValidSortBy =
        !sortBy || (sortBy && articlesSortValues.includes(sortBy));

      if (hasValidSortBy) {
        const searchResponse = await clients.elastic.search<Displayable>({
          index,
          body: {
            ...paginationElasticBody(req.query),
            _source: ["display"],
            query: queryString
              ? {
                  multi_match: {
                    query: queryString,
                    fields: [
                      "query.title.shingles^100",
                      "query.title.keyword^100",
                      "query.contributors^10",
                      "query.contributors.keyword^100",
                      "query.title.cased^10",
                      "query.standfirst^10",
                      "query.body",
                      "query.caption",
                    ],
                    operator: "or",
                    type: "cross_fields",
                    minimum_should_match: "-25%",
                  },
                }
              : undefined,
          },
          sort:
            sortBy === "publication.date"
              ? [
                  {
                    "query.publicationDate": {
                      order: sortOrder === "asc" ? "asc" : "desc",
                    },
                  },
                ]
              : ["_score"],
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
      } else {
        throw new HttpError({
          status: 400,
          label: `'Sort by' value is not valid: ${sortBy}. Did you mean: ${articlesSortValues.join(
            ", "
          )}?`,
        });
      }
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
