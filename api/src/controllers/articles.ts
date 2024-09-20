import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable } from "@weco/content-api/src/types";
import { PaginationQueryParameters, paginationElasticBody } from "./pagination";
import { Config } from "@weco/content-api/config";
import {
  articlesAggregations,
  articlesFilter,
  articlesQuery,
} from "@weco/content-api/src/queries/articles";
import { queryValidator, validateDate } from "./validation";
import { ifDefined, pick } from "@weco/content-api/src/helpers";
import { HttpError } from "./error";
import { ResultList } from "@weco/content-api/src/types/responses";
import { resultListResponse } from "@weco/content-api/src/helpers/responses";
import { AggregationsAggregate } from "@elastic/elasticsearch/lib/api/types";
import {
  partitionFiltersForFacets,
  rewriteAggregationsForFacets,
} from "@weco/content-api/src/queries/faceting";
import { esQuery } from "@weco/content-api/src/queries/common";
import { pickFiltersFromQuery } from "@weco/content-api/src/helpers/requests";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  aggregations?: string;
  "contributors.contributor"?: string;
  "publicationDate.from"?: string;
  "publicationDate.to"?: string;
  format?: string;
} & PaginationQueryParameters;

type ArticlesHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: "sort",
  defaultValue: "relevance",
  allowed: ["relevance", "publicationDate"],
  singleValue: true,
});

const sortOrderValidator = queryValidator({
  name: "sortOrder",
  defaultValue: "desc",
  allowed: ["asc", "desc"],
  singleValue: true,
});

const aggregationsValidator = queryValidator({
  name: "aggregations",
  allowed: ["contributors.contributor", "format"],
});

const articlesController = (
  clients: Clients,
  config: Config,
): ArticlesHandler => {
  const index = config.articlesIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...params } = req.query;
    const sort = sortValidator(params)?.[0];
    const sortOrder = sortOrderValidator(params)?.[0];
    const aggregations = aggregationsValidator(params);

    const sortKey =
      sort === "publicationDate" ? "query.publicationDate" : "_score";

    const initialAggregations = ifDefined(aggregations, (requestedAggs) =>
      pick(articlesAggregations, requestedAggs),
    );
    const initialFilters = pickFiltersFromQuery(
      ["contributors.contributor", "format"],
      params,
      articlesFilter,
    );

    // See comments in `queries/faceting.ts` for some explanation of what's going on here
    const { postFilters, queryFilters } = partitionFiltersForFacets(
      initialAggregations ?? {},
      initialFilters,
    );
    const facetedAggregations = ifDefined(initialAggregations, (aggs) =>
      rewriteAggregationsForFacets(aggs, postFilters),
    );

    // The date filter is a special case because 2 parameters filter 1 field,
    // and it doesn't (currently) have a corresponding aggregation.
    const dateFilters =
      params["publicationDate.from"] || params["publicationDate.to"]
        ? [
            articlesFilter.publicationDate(
              ifDefined(params["publicationDate.from"], validateDate),
              ifDefined(params["publicationDate.to"], validateDate),
            ),
          ]
        : [];

    try {
      const searchResponse = await clients.elastic.search<
        Displayable,
        Partial<
          Record<keyof typeof articlesAggregations, AggregationsAggregate>
        >
      >({
        index,
        _source: ["display"],
        aggregations: facetedAggregations,
        query: {
          bool: {
            must: ifDefined(queryString, articlesQuery),
            filter: [
              Object.values(queryFilters).map(esQuery),
              dateFilters,
            ].flat(),
          },
        },
        post_filter: {
          bool: {
            filter: Object.values(postFilters).map(esQuery),
          },
        },
        sort: [
          { [sortKey]: { order: sortOrder } },
          // Use recency as a "tie-breaker" sort
          { "query.publicationDate": { order: "desc" } },
        ],
        ...paginationElasticBody(req.query),
      });

      res.status(200).json(resultList(req, searchResponse));
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
