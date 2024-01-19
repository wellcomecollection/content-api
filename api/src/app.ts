import express from "express";
import morgan from "morgan";
import { logStream } from "@weco/content-common/services/logging";
import {
  errorHandler,
  articlesController,
  articleController,
  eventController,
  eventsController,
  healthcheckController,
} from "./controllers";
import { Config } from "../config";
import { Clients } from "./types";

const createApp = (clients: Clients, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/articles", articlesController(clients, config));
  app.get("/articles/:id", articleController(clients, config));
  app.get("/events", eventsController(clients, config));
  app.get("/events/:id", eventController(clients, config));
  app.get("/management/healthcheck", healthcheckController(config));

  app.use(errorHandler);

  return app;
};
export default createApp;
