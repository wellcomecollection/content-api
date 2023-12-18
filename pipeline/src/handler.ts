import { Handler } from "aws-lambda";

import { Clients } from "./types";
import { WindowEvent } from "./event";
import { ETLArticlesPipeline } from "./extractTransformLoadArticles";
import { ETLEventsPipeline } from "./extractTransformLoadEvents";

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    await ETLArticlesPipeline(clients, event);
    await ETLEventsPipeline(clients, event);
  };
