import * as prismic from "@prismicio/client";
import log from "@weco/content-common/services/logging";
import { getDocumentsByType } from "./helpers/prismic";
import { Clients } from "./types";
import {
  ensureIndexExists,
  IndexConfig,
  HasIdentifier,
} from "./helpers/elasticsearch";

import { describeWindow, toBoundedWindow, WindowEvent } from "./event";

type ETLParameters<PrismicDocument, ElasticsearchDocument> = {
  indexConfig: IndexConfig;
  graphQuery: string;
  documentType: string;
  transformer: (prismicDoc: PrismicDocument) => ElasticsearchDocument;
};

export const createETLByTypePipeline =
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

    const documents = await getDocumentsByType(clients.prismic, {
      publicationWindow: toBoundedWindow(event),
      graphQuery: etlParameters.graphQuery,
      documentType: etlParameters.documentType,
    });

    const transformedDocuments = documents.map((document) =>
      etlParameters.transformer(document as PrismicDocument)
    );

    const result = await clients.elastic.helpers.bulk({
      datasource: transformedDocuments,
      onDocument(doc) {
        return {
          index: { _index: etlParameters.indexConfig.index, _id: doc.id },
        };
      },
    });

    log.info(
      `Indexed ${result.successful} ${etlParameters.documentType} documents in ${result.time}ms.`
    );
  };
