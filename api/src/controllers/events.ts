import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable } from "../types";
import { PaginationQueryParameters, paginationElasticBody } from "./pagination";
import { Config } from "../../config";
import { HttpError } from "./error";
import { ResultList } from "../types/responses";
import { resultListResponse } from "../helpers/responses";
import { queryValidator } from "./validation";
import { ifDefined, pick } from "../helpers";
import {
  eventsAggregations,
  eventsFilter,
  eventsQuery,
} from "../queries/events";
import { pickFiltersFromQuery } from "../helpers/requests";
import { esQuery } from "../queries/common";
import { rewriteAggregationsForFacets } from "../queries/faceting";

const util = require("util");

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  aggregations?: string;
  format?: string;
  audience?: string;
  interpretation?: string;
  isOnline?: string;
} & PaginationQueryParameters;

type EventsHandler = RequestHandler<never, ResultList, never, QueryParams>;

const sortValidator = queryValidator({
  name: "sort",
  defaultValue: "relevance",
  allowed: ["relevance", "times.startDateTime"],
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
  allowed: ["format", "audience", "interpretation", "isOnline"],
});

const eventsController = (clients: Clients, config: Config): EventsHandler => {
  const index = config.eventsIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...params } = req.query;
    const sort = sortValidator(params)?.[0];
    const sortOrder = sortOrderValidator(params)?.[0];
    const aggregations = aggregationsValidator(params);
    const sortKey =
      sort === "times.startDateTime" ? "query.times.startDateTime" : "_score";

    const initialAggregations = ifDefined(aggregations, (requestedAggs) =>
      pick(eventsAggregations, requestedAggs)
    );

    const postFilters = pickFiltersFromQuery(
      ["format", "audience", "interpretation", "isOnline"],
      params,
      eventsFilter
    );

    const facetedAggregations = ifDefined(initialAggregations, (aggs) =>
      rewriteAggregationsForFacets(aggs, postFilters)
    );

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ["display"],
        aggregations: facetedAggregations,
        query: {
          bool: {
            must: ifDefined(queryString, eventsQuery),
            must_not: {
              term: {
                isChildScheduledEvent: true, // exclude childScheduledEvents from search
              },
            },
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
          { "query.times.startDateTime": { order: "desc" } },
        ],
        ...paginationElasticBody(req.query),
      });

      res.status(200).json(resultList(req, searchResponse));
    } catch (error) {
      if (
        error instanceof elasticErrors.ResponseError &&
        error.message.includes("too_many_nested_clauses") &&
        encodeURIComponent(queryString || "").length > 2000
      ) {
        throw new HttpError({
          status: 400,
          label: "Bad Request",
          description:
            "Your query contained too many terms, please try again with a simpler query",
        });
      }
      throw error;
    }
  });
};

export default eventsController;
