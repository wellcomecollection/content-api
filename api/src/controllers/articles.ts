import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable, ResultList } from "../types";
import {
  PaginationQueryParameters,
  paginationElasticBody,
  paginationResponseGetter,
} from "./pagination";
import { Config } from "../../config";
import { HttpError } from "./error";
import { articlesQuery } from "../queries/articles";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const articlesSortValues = ["relevance", "publication.dates"];

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.contentsIndex;

  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  return asyncHandler(async (req, res) => {
    const { query: queryString, sort: sortBy, sortOrder } = req.query;

    const hasValidSortBy =
      !sortBy || (sortBy && articlesSortValues.includes(sortBy));
    if (!hasValidSortBy) {
      throw new HttpError({
        status: 400,
        label: `'Sort by' value is not valid: ${sortBy}. Did you mean: ${articlesSortValues.join(
          ", "
        )}?`,
      });
    }

    const searchResponse = await clients.elastic.search<Displayable>({
      index,
      _source: ["display"],
      query: queryString ? articlesQuery(queryString) : undefined,
      sort: [
        {
          [sortBy === "publication.dates" ? "query.publicationDate" : "_score"]:
            {
              order: sortOrder === "asc" ? "asc" : "desc",
            },
        },
      ],
      ...paginationElasticBody(req.query),
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
};

export default articlesController;
