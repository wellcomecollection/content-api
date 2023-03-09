import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, ResultList, TransformedArticle } from "../types";

import { Config } from "../../config";
import { HttpError } from "./error";
import { transformContentTypeList } from "../transformers/transformers";

type PathParams = { contentType: string };

type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string; // TODO ?
};

type ContentListHandler = RequestHandler<
  PathParams,
  ResultList<TransformedArticle>,
  QueryParams
>;

const contentTypeListController = (
  clients: Clients,
  config: Config // TODO ?
): ContentListHandler => {
  const prismicClient = clients.prismic;
  const allowedContentTypes = ["articles", "events", "exhibitions"];

  return asyncHandler(async (req, res) => {
    if (allowedContentTypes.includes(req.params.contentType)) {
      try {
        const searchResponse = await prismicClient.getByType(
          req.params.contentType
        );

        const transformedResponse = transformContentTypeList(
          searchResponse.results
        );

        res.status(200).json({
          type: "ResultList",
          results: transformedResponse,
        });
      } catch (error) {
        throw error;
      }
    } else {
      throw new HttpError({
        status: 400,
        label: "Bad Request",
        description: "This content type does not exist",
      });
    }
  });
};

export default contentTypeListController;
