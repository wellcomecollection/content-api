import { createUnpublisher } from "./unpublisher";
import { getConfig } from "./config";

const config = getConfig();

export const eventsUnpublisher = createUnpublisher(config.indices.eventsIndex);
