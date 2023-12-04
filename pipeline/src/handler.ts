import { Handler } from "aws-lambda";

import { Clients } from "./types";
import { WindowEvent } from "./event";
import { ETLArticles } from "./extractTransformLoadArticles";
import { ETLEvents } from "./extractTransformLoadEvents";

export const createHandler =
  (clients: Clients): Handler<WindowEvent> =>
  async (event, context) => {
    await ETLEvents(clients, event);
    await ETLArticles(clients, event);
  };
