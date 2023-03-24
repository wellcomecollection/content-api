import express from "express";
import morgan from "morgan";
import { logStream } from "./services/logging";
import {
  errorHandler,
  articlesController,
  articleController,
} from "./controllers";
import { Config } from "../config";
import { Clients } from "./types";

const createApp = (clients: Clients, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/articles", articlesController(clients.elastic, config));
  app.get("/articles/:id", articleController(clients.elastic, config));

  app.use(errorHandler);

  return app;
};
export default createApp;
