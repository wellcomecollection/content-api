import { createUnpublisher } from "./unpublisher";
import { getConfig } from "./config";

const config = getConfig();

export const articlesUnpublisher = createUnpublisher(
  config.indices.articlesIndex
);
