// This must be the first import in the app!
import "@weco/content-common/services/init-apm";

import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import log from "@weco/content-common/services/logging";

import { getConfig } from "./config";
import createApp from "./src/app";

const config = getConfig();

const isRunningInECS = "ECS_CONTAINER_METADATA_URI_V4" in process.env;

getElasticClient({
  serviceName: "api",
  pipelineDate: config.pipelineDate,
  hostEndpointAccess: isRunningInECS ? "private" : "public",
}).then(async (elasticClient) => {
  const app = createApp({ elastic: elasticClient }, config);
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    log.info(`Content API listening on port ${port}`);
  });
});
