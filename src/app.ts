import express from "express";
import morgan from "morgan";
import { logStream } from "./services/logging";
import {
  errorHandler,
  contentTypeListController,
  contentTypeController,
} from "./controllers";
import { Config } from "../config";
import { Clients } from "./types";

const createApp = (clients: Clients, config: Config) => {
  const app = express();

  app.use(morgan("short", { stream: logStream("http") }));

  app.get("/:contentType", contentTypeListController(clients, config));
  app.get("/:contentType/:id", contentTypeController(clients, config));

  app.use(errorHandler);

  return app;
};

export default createApp;
