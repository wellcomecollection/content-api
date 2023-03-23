import express from "express";
import morgan from "morgan";
import { logStream } from "./services/logging";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import {
  errorHandler,
  articlesController,
  articleController,
} from "./controllers";
import { Config } from "../config";

const createApp = (elasticClient: ElasticClient, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/articles", articlesController(elasticClient, config));
  app.get("/articles/:id", articleController(elasticClient, config));

  app.use(errorHandler);

  return app;
};
export default createApp;
