import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { ArticlePrismicDocument, Clients, TransformedArticle } from "../types";

import { Config } from "../../config";
import { fetcher } from "./fetcher";
import { transformArticle } from "../transformers/article";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, TransformedArticle>;

export const articleFetcher = fetcher<ArticlePrismicDocument>(["articles"]);

const articleController = (
  clients: Clients,
  config: Config // TODO we might want this later?
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
        throw console.error("404"); // TODO send better error
      }
    } catch (error) {
      throw error;
    }
  });
};

export default articleController;
