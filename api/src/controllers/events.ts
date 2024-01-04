import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable } from "../types";
import { PaginationQueryParameters, paginationElasticBody } from "./pagination";
import { Config } from "../../config";
import { HttpError } from "./error";
import { ResultList } from "../types/responses";
import { resultListResponse } from "../helpers/responses";

type QueryParams = {
  query?: string;
  sort?: string;
  sortOrder?: string;
  aggregations?: string;
  format?: string;
} & PaginationQueryParameters;

type EventsHandler = RequestHandler<never, ResultList, never, QueryParams>;

const eventsController = (clients: Clients, config: Config): EventsHandler => {
  const index = config.eventsIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const { query: queryString, ...params } = req.query;
    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ["display"],
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
