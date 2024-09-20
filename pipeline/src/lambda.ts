// This must be the first import in the app!
import "@weco/content-common/services/init-apm";

import { Handler } from "aws-lambda";

import { getElasticClient } from "@weco/content-common/services/elasticsearch";

import { getConfig } from "./config";
import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";

const config = getConfig();

// This is a hoop we jump through because we need to create the handler asynchronously
// (as we're fetching secrets) but we don't want to do that for every call, just for
// every cold start of the Lambda.
const initialiseHandler = async () => {
  const elasticClient = await getElasticClient({
    pipelineDate: config.pipelineDate,
    serviceName: "pipeline",
    hostEndpointAccess: "private",
  });
  const prismicClient = createPrismicClient();
  return createHandler({ elastic: elasticClient, prismic: prismicClient });
};

const handlerPromise = initialiseHandler();

export const handler: Handler = async (event, context, cb) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event, context, cb);
};
