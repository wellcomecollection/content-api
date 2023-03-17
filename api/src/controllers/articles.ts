import { RequestHandler } from "express";
import * as prismic from "@prismicio/client";
import asyncHandler from "express-async-handler";
import {
  ArticlePrismicDocument,
  Clients,
  ContentType,
  ResultList,
  Article,
} from "../types";
import { Config } from "../../config";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { articlesContentTypes, graphQueryArticles } from "../helpers/articles";

type PathParams = { contentType: string };

// TODO Unused now, but for when we add querying capabilities
type QueryParams = {
  query?: string;
  "identifiers.identifierType"?: string;
};

type ArticlesHandler = RequestHandler<
  PathParams,
  ResultList<Article>,
  QueryParams
>;
const articlesController = (
  clients: Clients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticlesHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    try {
      const searchResponse = await prismicClient.get<
        ArticlePrismicDocument & {
          contentType: ContentType | ContentType[];
        }
      >({
        graphQuery: graphQueryArticles,
        predicates: [
          prismic.predicate.any("document.type", articlesContentTypes),
        ],
      });

      if (searchResponse) {
        const transformedResponse = searchResponse.results.map((result) =>
          transformArticle(result)
        );

        res.status(200).json({
          type: "ResultList",
          results: transformedResponse,
          totalResults: searchResponse.total_results_size,
          totalPages: searchResponse.total_pages,
          pageSize: searchResponse.results_per_page, // TODO This should be customisable, not worth doing until we move to ES?
        });
      } else {
        throw new HttpError({
          status: 404,
          label: "No results found",
        });
      }
    } catch (error) {
      // TODO add error checking once we get ES in
      throw error;
    }
  });
};

export default articlesController;
