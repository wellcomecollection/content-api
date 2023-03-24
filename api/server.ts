// This must be the first import in the app!
import "./src/services/init-apm";

import createApp from "./src/app";
import { getConfig } from "./config";
import log from "./src/services/logging";
import { createPrismicClient } from "./src/services/prismic";
import { getElasticClient } from "./src/services/elasticsearch";

const config = getConfig();
const prismicClient = createPrismicClient();

getElasticClient({ pipelineDate: config.pipelineDate }).then(
  async (elasticClient) => {
    const app = createApp(
      { elastic: elasticClient, prismic: prismicClient },
      config
    );
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      log.info(`Content API listening on port ${port}`);
    });
  }
);
