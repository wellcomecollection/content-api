import { errors as elasticErrors } from "@elastic/elasticsearch";
import { RequestHandler } from "express";
import * as prismic from "@prismicio/client";
import asyncHandler from "express-async-handler";
import {
  Clients,
  Displayable,
  ElasticClients,
  Article,
  ArticlePrismicDocument,
  ContentType,
} from "../types";
import { Config } from "../../config";
import { transformArticle } from "../transformers/article";
import { HttpError } from "./error";
import { QueryParams } from "@prismicio/client";
import { articlesContentTypes, graphQueryArticles } from "../helpers/articles";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, Article>;

const articleController = (
  clients: Clients | ElasticClients,
  config: Config // TODO Unused now but required when we move to using ElasticSearch
): ArticleHandler => {
  if ("prismic" in clients) {
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

        const searchResponse = await clients.prismic.getByID<
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
        throw error;
      }
    });
  } else if ("elastic" in clients) {
    const index = config.contentsIndex;
    const elasticClient = clients.elastic;

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
  } else {
    // To remove when cleaning up Prismic v ES
    throw new HttpError({
      status: 500,
      label: "Internal Server Error",
    });
  }
};

export default articleController;
