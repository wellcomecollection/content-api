import {
  errors as elasticErrors,
  Client as ElasticClient,
} from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Displayable, Article } from "../types";
import { Config } from "../../config";
import { HttpError } from "./error";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, Article>;

const articleController = (
  elasticClient: ElasticClient,
  config: Config
): ArticleHandler => {
  const index = config.contentsIndex;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      const getResponse = await elasticClient.get<Displayable<Article>>({
        index,
        id,
        _source: ["display"],
      });

      res.status(200).json(getResponse._source!.display);
    } catch (error) {
      if (error instanceof elasticErrors.ResponseError) {
        if (error.statusCode === 404) {
          throw new HttpError({
            status: 404,
            label: "Not Found",
            description: `Article not found for identifier ${id}`,
          });
        }
      }
      throw error;
    }
  });
};

export default articleController;
