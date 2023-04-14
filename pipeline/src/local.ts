import { Context } from "aws-lambda";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";

const prismicClient = createPrismicClient();

getElasticClient({
  pipelineDate: "2023-03-24",
  serviceName: "pipeline",
  hostEndpointAccess: "public",
}).then((elasticClient) => {
  const handler = createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
  return handler({}, {} as Context, () => {});
});
