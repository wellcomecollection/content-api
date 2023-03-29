// This must be the first import in the app!
import "@weco/content-common/services/init-apm";

import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";
import { Handler } from "aws-lambda";

// This is a hoop we jump through because we need to create the handler asynchronously
// (as we're fetching secrets) but we don't want to do that for every call, just for
// every cold start of the Lambda.
const initialiseHandler = async () => {
  const elasticClient = await getElasticClient({
    pipelineDate: "2023-03-24",
    serviceName: "pipeline",
  });
  const prismicClient = createPrismicClient();
  return createHandler({ elastic: elasticClient, prismic: prismicClient });
};

const handlerPromise = initialiseHandler();

export const handler: Handler = async (event, context, cb) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event, context, cb);
};
