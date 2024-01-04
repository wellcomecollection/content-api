import { createUnpublisher } from "./unpublisher";
import { getConfig } from "./config";

const config = getConfig();

export const eventDocumentsUnpublisher = createUnpublisher(
  config.indices.eventdocumentsIndex
);
