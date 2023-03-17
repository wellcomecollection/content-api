import { RequestHandler } from "express";
import * as prismic from "@prismicio/client";
import asyncHandler from "express-async-handler";
import {
  ArticlePrismicDocument,
  Clients,
  ContentType,
  Article,
} from "../types";
import { Config } from "../../config";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { articlesContentTypes, graphQueryArticles } from "../helpers/articles";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, Article>;

const articleController = (
  clients: Clients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticleHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;

    try {
      // This means that Prismic will only return the document with the given ID if
      // it matches the content type.  So e.g. going to /events/<exhibition ID> will
      // return a 404, rather than a 500 as we find we're missing a bunch of fields
      // we need to render the page.
      const predicates = [
        prismic.predicate.any("document.type", articlesContentTypes),
      ];

      const searchResponse = await prismicClient.getByID<
        ArticlePrismicDocument & {
          contentType: ContentType | ContentType[];
        }
      >(id, {
        predicates,
        graphQuery: graphQueryArticles,
      });

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
      // TODO add error checking once we get ES in
      throw error;
    }
  });
};

export default articleController;
