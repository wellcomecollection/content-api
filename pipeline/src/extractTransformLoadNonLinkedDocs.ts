import * as prismic from "@prismicio/client";
import {} from "@elastic/elasticsearch";
import log from "@weco/content-common/services/logging";
import { getPrismicDocuments } from "./helpers/prismic";
import { Clients } from "./types";
import {
  ensureIndexExists,
  bulkIndexDocuments,
  IndexConfig,
  HasIdentifier,
} from "./helpers/elasticsearch";

import { describeWindow, toBoundedWindow, WindowEvent } from "./event";

type ETLParameters<PrismicDocument, ElasticsearchDocument> = {
  indexConfig: IndexConfig;
  graphQuery: string;
  transformer: (prismicDoc: PrismicDocument) => ElasticsearchDocument;
};

export const createNonLinkedDocETLPipeline =
  <
    PrismicDocument extends prismic.PrismicDocument,
    ElasticsearchDocument extends HasIdentifier
  >(
    etlParameters: ETLParameters<PrismicDocument, ElasticsearchDocument>
  ) =>
  async (clients: Clients, event: WindowEvent) => {
    // 0. Create index if necessary
    await ensureIndexExists(clients.elastic, etlParameters.indexConfig);

    const window = toBoundedWindow(event);
    log.info(
      `Fetching ${
        etlParameters.indexConfig.index
      } last published ${describeWindow(window)}`
    );

    const { docs } = await getPrismicDocuments(clients.prismic, {
      publicationWindow: toBoundedWindow(event),
      graphQuery: etlParameters.graphQuery,
    });

    const operations = docs.flatMap((doc) => [
      { index: { _index: "venues" } },
      doc,
    ]);

    await clients.elastic.bulk({ refresh: true, operations });

    log.info(`Indexed ${docs.length} documents`);
  };
