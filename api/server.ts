// This must be the first import in the app!
import "@weco/content-common/services/init-apm";

import createApp from "./src/app";
import { getConfig } from "./config";
import log from "@weco/content-common/services/logging";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";

const config = getConfig();

getElasticClient({
  serviceName: "api",
  pipelineDate: config.pipelineDate,
}).then(async (elasticClient) => {
  const app = createApp({ elastic: elasticClient }, config);
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    log.info(`Content API listening on port ${port}`);
  });
});
