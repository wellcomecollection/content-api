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
  "contributors.contributor"?: string;
  "publicationDate.from"?: string;
  "publicationDate.to"?: string;
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
