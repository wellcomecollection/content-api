import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { getConfig } from "./config";
import { Handler } from "aws-lambda";
import { getSecret } from "@weco/content-common/services/aws";

const config = getConfig();
const initialiseHandler = async () => {
  const elasticClient = await getElasticClient({
    pipelineDate: config.pipelineDate,
    serviceName: "unpublisher",
    hostEndpointAccess: "private",
  });
  const secret = await getSecret("prismic/content-unpublisher/secret");
  if (!secret) {
    throw new Error("A secret must be specified!");
  }
  return createHandler(
    { elastic: elasticClient },
    { index: config.index, secret }
  );
};

const handlerPromise = initialiseHandler();

export const handler: Handler = async (event, context, cb) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event, context, cb);
};
