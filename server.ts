import createApp from "./src/app";
import { getConfig } from "./config";
import log from "./src/services/logging";
import { createPrismicClient } from "./src/services/prismic";

const config = getConfig();

const prismic = createPrismicClient();

const app = createApp({ prismic }, config);
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  log.info(`Content API listening on port ${port}`);
});
