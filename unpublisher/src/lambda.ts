import { Handler } from "aws-lambda";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { getConfig } from "./config";

const config = getConfig();
const initialiseHandler = async () => {
  const elasticClient = await getElasticClient({
    pipelineDate: config.pipelineDate,
    serviceName: "unpublisher",
    hostEndpointAccess: "private",
  });
  return createHandler({ elastic: elasticClient }, { index: config.index });
};

const handlerPromise = initialiseHandler();

export const handler: Handler = async (event, context, cb) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event, context, cb);
};
