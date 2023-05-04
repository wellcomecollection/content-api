import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable, ResultList } from "../types";
import {
  PaginationQueryParameters,
  paginationElasticBody,
  paginationResponseGetter,
} from "./pagination";
import { Config } from "../../config";
import { articlesQuery } from "../queries/articles";
import { queryValidator } from "./validation";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: "sort",
  defaultValue: "relevance",
  allowed: ["relevance", "publication.dates"],
});

const sortOrderValidator = queryValidator({
  name: "sortOrder",
  defaultValue: "desc",
  allowed: ["asc", "desc"],
});

const articlesController = (
  clients: Clients,
  config: Config
): ArticlesHandler => {
  const index = config.contentsIndex;
  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...queryParams } = req.query;
    const sort = sortValidator(queryParams);
    const sortOrder = sortOrderValidator(queryParams);

    const searchResponse = await clients.elastic.search<Displayable>({
      index,
      _source: ["display"],
      query: queryString ? articlesQuery(queryString) : undefined,
      sort: [
        {
          [sort === "publication.dates" ? "query.publicationDate" : "_score"]: {
            order: sortOrder,
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
