import { eventDocumentsQuery } from "./graph-queries";
import { events } from "./indices";
import { transformEventDocument } from "./transformers/eventDocument";
import { createETLPipeline } from "./extractTransformLoad";

export const ETLEventsPipeline = createETLPipeline({
  graphQuery: eventDocumentsQuery,
  indexConfig: events,
  parentDocumentTypes: new Set(["events"]),
  transformer: transformEventDocument,
});
