import { argv } from "node:process";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { getSecret } from "@weco/content-common/services/aws";
import { Context, EventBridgeEvent } from "aws-lambda";
import { WebhookBodyAPIUpdate } from "@prismicio/types";

const [_1, _2, ...deletionIds] = argv;

export const eventBridgePrismicEvent = (
  documents: string[]
): EventBridgeEvent<"api-update", WebhookBodyAPIUpdate> => ({
  account: "",
  id: "",
  region: "",
  resources: [],
  source: "",
  time: "",
  version: "",
  "detail-type": "api-update",
  detail: {
    type: "api-update",
    domain: "",
    apiUrl: "",
    secret: "",
    releases: {},
    masks: {},
    tags: {},
    documents,
  },
});

getElasticClient({
  pipelineDate: "2023-03-24",
  serviceName: "unpublisher",
  hostEndpointAccess: "public",
}).then(async (elasticClient) => {
  const secret = await getSecret("prismic/content-unpublisher/secret");
  if (!secret) {
    throw new Error("A secret must be specified!");
  }
  const handler = createHandler(
    { elastic: elasticClient },
    { index: "articles" }
  );

  await handler(eventBridgePrismicEvent(deletionIds), {} as Context, () => {});
});
