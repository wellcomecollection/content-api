import { argv } from "node:process";
import { Context } from "aws-lambda";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { getSecret } from "@weco/content-common/services/aws";
import { createHandler } from "./handler";
import { eventBridgePrismicEvent } from "./event";

const [_1, _2, ...deletionIds] = argv;

getElasticClient({
  pipelineDate: "2023-03-24",
  serviceName: "unpublisher",
  hostEndpointAccess: "public",
}).then(async (elasticClient) => {
  const secret = await getSecret("prismic/content-unpublisher/secret");
  if (!secret) {
    throw new Error("A secret must be specified!");
  }
  const handler = createHandler({ elastic: elasticClient });

  await handler(eventBridgePrismicEvent(deletionIds), {} as Context, () => {});
});
