import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import {
  ArticlePrismicDocument,
  Clients,
  ResultList,
  TransformedArticle,
} from "../types";
import { Config } from "../../config";
import { transformArticles } from "../transformers/articles";
import { fetcher } from "./fetcher";

type PathParams = { contentType: string };

type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string; // TODO unsure what this is for?
};

type ContentListHandler = RequestHandler<
  PathParams,
  ResultList<TransformedArticle>,
  QueryParams
>;

// TODO figure out if fetchLinks are useful here? Isn't not all done with GraphQuery?
export const articlesFetcher = fetcher<ArticlePrismicDocument>(["articles"]);

const articlesController = (
  clients: Clients,
  config: Config // TODO we might want this later?
): ContentListHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    try {
      const searchResponse = await articlesFetcher.getByType({
        type: "GetServerSidePropsPrismicClient",
        client: prismicClient,
      });

      const transformedResponse = transformArticles(searchResponse.results);

      res.status(200).json({
        type: "ResultList",
        results: transformedResponse,
      });
    } catch (error) {
      throw error;
    }
  });
};

export default articlesController;
