import { Context } from "aws-lambda";
import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";
import { getElasticClient } from "./services/elasticsearch";

const prismicClient = createPrismicClient();

getElasticClient().then(async (elasticClient) => {
  const handler = createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
  return handler({}, {} as Context, () => {});
});
