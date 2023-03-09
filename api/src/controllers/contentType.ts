import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, ContentType } from "../types";

import { Config } from "../../config";

type PathParams = { id: string };

type ContentTypeHandler = RequestHandler<PathParams, ContentType>;

const contentTypeController = (
  clients: Clients,
  config: Config
): ContentTypeHandler => {
  const prismicClient = clients.prismic;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;

    try {
      const searchResponse  = await prismicClient.getByID(id);

      res.status(200).json(searchResponse as ContentType);
    } catch (error) {
      throw error;
    }
  });
};

export default contentTypeController;
