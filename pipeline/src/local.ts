import { Context } from "aws-lambda";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";
import { WindowEvent } from "./event";

const prismicClient = createPrismicClient();

const contentType = (process.argv[2] ?? "all") as
  | "articles"
  | "events"
  | "venues"
  | "all";

// Reindexes all documents by default
const windowEvent: WindowEvent = {
  contentType,
  start: undefined,
  end: undefined,
};

getElasticClient({
  pipelineDate: "2023-03-24",
  serviceName: "pipeline",
  hostEndpointAccess: "public",
}).then((elasticClient) => {
  const handler = createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
  return handler(windowEvent, {} as Context, () => {});
});
