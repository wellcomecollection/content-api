import express from "express";
import morgan from "morgan";
import { logStream } from "./services/logging";
import {
  errorHandler,
  articlesController,
  articleController,
} from "./controllers";
import { Config } from "../config";
import { Clients, ElasticClients } from "./types";

const createApp = (clients: Clients, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/articles", articlesController(clients, config));
  app.get("/articles/:id", articleController(clients, config));

  app.use(errorHandler);

  return app;
};
export default createApp;

export const createAppElastic = (clients: ElasticClients, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/articles", articlesController(clients, config));
  app.get("/articles/:id", articleController(clients, config));

  app.use(errorHandler);

  return app;
};
