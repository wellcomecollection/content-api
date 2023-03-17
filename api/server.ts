// This must be the first import in the app!
import "./src/services/init-apm";

import createApp from "./src/app";
import { getConfig } from "./config";
import log from "./src/services/logging";
import { createPrismicClient } from "./src/services/prismic";
import { getElasticClient } from "./src/services/elasticsearch";

const config = getConfig();

const prismic = createPrismicClient();

const app = createApp({ prismic }, config);
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  log.info(`Content API listening on port ${port}`);
});

getElasticClient({ pipelineDate: config.pipelineDate }).then((elastic) => {
  const app = createApp({ elastic }, config);
  // Uncomment when ES only
  // const port = process.env.PORT ?? 3001;
  const port = 3001;
  app.listen(port, () => {
    log.info(`Content (Elastic) API listening on port ${port}`);
  });
});
