import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable, ResultList } from "../types";
import {
  PaginationQueryParameters,
  paginationElasticBody,
  paginationResponseGetter,
} from "./pagination";
import { Config } from "../../config";
import { articlesFilter, articlesQuery } from "../queries/articles";
import { queryValidator } from "./validation";
import { HttpError } from "./error";
import { ifDefined, isNotUndefined } from "../helpers";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  "contributors.contributor"?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: "sort",
  defaultValue: "relevance",
  allowed: ["relevance", "publicationDate"],
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

    const sortKey =
      sort === "publicationDate" ? "query.publicationDate" : "_score";

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ["display"],
        query: {
          bool: {
            must: ifDefined(queryString, articlesQuery),
            filter: [
              ifDefined(
                queryParams["contributors.contributor"]?.split(","),
                articlesFilter.contributors
              ),
            ].filter(isNotUndefined),
          },
        },
        sort: [
          { [sortKey]: { order: sortOrder } },
          // Use recency as a "tie-breaker" sort
          { "query.publicationDate": { order: "desc" } },
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
    } catch (e) {
      if (
        e instanceof elasticErrors.ResponseError &&
        // This is an error we see from very long (spam) queries which contain
        // many many terms and so overwhelm the multi_match query. The check
        // for length is a heuristic so that if we get legitimate `too_many_nested_clauses`
        // errors, we're still alerted to them
        e.message.includes("too_many_nested_clauses") &&
        encodeURIComponent(queryString || "").length > 2000
      ) {
        throw new HttpError({
          status: 400,
          label: "Bad Request",
          description:
            "Your query contained too many terms, please try again with a simpler query",
        });
      }
      throw e;
    }
  });
};

export default articlesController;
