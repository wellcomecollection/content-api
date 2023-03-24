import { createHandler } from "./handler";
import { createPrismicClient } from "./services/prismic";
import { getElasticClient } from "./services/elasticsearch";

const prismicClient = createPrismicClient();

getElasticClient().then(async (elasticClient) => {
  createHandler({
    prismic: prismicClient,
    elastic: elasticClient,
  });
});
