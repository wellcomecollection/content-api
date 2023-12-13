import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable } from "../types";
import { PaginationQueryParameters, paginationElasticBody } from "./pagination";
import { Config } from "../../config";
import {
  articlesAggregations,
  articlesFilter,
  articlesQuery,
} from "../queries/articles";
import { queryValidator, validateDate } from "./validation";
import { ifDefined, pick } from "../helpers";
import { HttpError } from "./error";
import { ResultList } from "../types/responses";
import { resultListResponse } from "../helpers/responses";
import { AggregationsAggregate } from "@elastic/elasticsearch/lib/api/types";
import {
  partitionFiltersForFacets,
  rewriteAggregationsForFacets,
} from "../queries/faceting";
import { esQuery } from "../queries/common";
import { pickFiltersFromQuery } from "../helpers/requests";

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

type EventsHandler = RequestHandler<never, ResultList, never, QueryParams>;

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

const eventsController = (clients: Clients, config: Config): EventsHandler => {
  const index = config.eventsIndex;
  const resultList = resultListResponse(config);

  // return asyncHandler(async (req, res) => {

  //   const sortKey =
  //     sort === "publicationDate" ? "query.publicationDate" : "_score";

  //   try {
  //     const searchResponse = await clients.elastic.search<
  //       Displayable
  //     >({
  //       index,
  //       _source: ["display"],
  //       query: {
  //         bool: {
  //           must: ifDefined(queryString, articlesQuery),

  //         },
  //       },
  //       sort: [
  //         { [sortKey]: { order: sortOrder } },
  //         // Use recency as a "tie-breaker" sort
  //         { "query.publicationDate": { order: "desc" } },
  //       ],
  //       ...paginationElasticBody(req.query),
  //     });

  //     res.status(200).json(resultList(req, searchResponse));
  //   } catch (e) {
  //     if (
  //       e instanceof elasticErrors.ResponseError &&
  //       // This is an error we see from very long (spam) queries which contain
  //       // many many terms and so overwhelm the multi_match query. The check
  //       // for length is a heuristic so that if we get legitimate `too_many_nested_clauses`
  //       // errors, we're still alerted to them
  //       e.message.includes("too_many_nested_clauses") &&
  //       encodeURIComponent(queryString || "").length > 2000
  //     ) {
  //       throw new HttpError({
  //         status: 400,
  //         label: "Bad Request",
  //         description:
  //           "Your query contained too many terms, please try again with a simpler query",
  //       });
  //     }
  //     throw e;
  //   }
  // });

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...params } = req.query;
    const sort = sortValidator(params)?.[0];
    const sortOrder = sortOrderValidator(params)?.[0];
    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ["display"],
      });

      res.status(200).json(resultList(req, searchResponse));
    } catch (error) {
      if (error instanceof elasticErrors.ResponseError) {
        if (error.statusCode === 404) {
          throw new HttpError({
            status: 404,
            label: "Not Found",
            description: `No events`,
          });
        }
      }
      throw error;
    }
  });
};

export default eventsController;
