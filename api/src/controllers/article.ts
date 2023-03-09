import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients } from "../types";
import { PrismicDocument } from "@prismicio/types";

import { Config } from "../../config";

type PathParams = { id: string };

type ArticleHandler = RequestHandler<PathParams, PrismicDocument>;

const articleController = (
  clients: Clients,
  config: Config
): ArticleHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;

    try {
      const searchResponse = await prismicClient.getByID(id);

      res.status(200).json(searchResponse as PrismicDocument);
    } catch (error) {
      throw error;
    }
  });
};

export default articleController;
