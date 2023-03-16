import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import {
  Clients,
  Displayable,
  ElasticClients,
  TransformedArticle,
} from "../types";

import { Config } from "../../config";
import { articlesFetcher } from "./fetcher";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { QueryParams } from "@prismicio/client";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, TransformedArticle>;

const articleController = (
  clients: Clients | ElasticClients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticleHandler => {
  if ("prismic" in clients) {
    return asyncHandler(async (req, res) => {
      const id = req.params.id;

      try {
        const searchResponse = await articlesFetcher.getById(
          {
            type: "GetServerSidePropsPrismicClient",
            client: clients.prismic,
          },
          id
        );

        if (searchResponse) {
          const transformedResponse = transformArticle(searchResponse);
          res.status(200).json(transformedResponse);
        } else {
          throw new HttpError({
            status: 404,
            label: "Article not found",
          });
        }
      } catch (error) {
        throw error;
      }
    });
  } else if ("elastic" in clients) {
    const index = config.contentsIndex;
    const elasticClient = clients.elastic;

    return asyncHandler(async (req, res) => {
      const id = req.params.id;
      try {
        const getResponse = await elasticClient.get<
          Displayable<TransformedArticle>
        >({
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
  } else {
    throw new HttpError({
      status: 500,
      label: "To remove when cleaning up Prismic v ES",
    });
  }
};

export default articleController;
