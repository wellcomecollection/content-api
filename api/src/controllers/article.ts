import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { ArticlePrismicDocument, Clients, TransformedArticle } from "../types";

import { Config } from "../../config";
import { fetcher } from "./fetcher";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, TransformedArticle>;

export const articleFetcher = fetcher<ArticlePrismicDocument>(["articles"]);

const articleController = (
  clients: Clients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticleHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;

    try {
      const searchResponse = await articleFetcher.getById(
        {
          type: "GetServerSidePropsPrismicClient",
          client: prismicClient,
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
};

export default articleController;
