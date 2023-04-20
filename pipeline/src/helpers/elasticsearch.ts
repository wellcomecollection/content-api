import { Client, errors as elasticErrors } from "@elastic/elasticsearch";
import {
  IndicesIndexSettings,
  MappingTypeMapping,
} from "@elastic/elasticsearch/lib/api/types";
import { Observable } from "rxjs";
import log from "@weco/content-common/services/logging";
import { observableToStream } from "./observableToStream";

type IndexConfig = {
  index: string;
  mappings?: MappingTypeMapping;
  settings?: IndicesIndexSettings;
};

export const ensureIndexExists = async (
  elasticClient: Client,
  indexConfig: IndexConfig
): Promise<void> => {
  try {
    await elasticClient.indices.create(indexConfig);
    log.info(`Index '${indexConfig.index}' was created`);
  } catch (e) {
    if (e instanceof elasticErrors.ResponseError) {
      if (e.message.includes("resource_already_exists_exception")) {
        log.info(`Index '${indexConfig.index}' already exists`);
        return;
      }
    }
    throw e;
  }
};

type HasIdentifier = {
  id: string;
};

type BulkIndexResult<Doc> = {
  successful: number;
  failed: Doc[];
  time: number;
};

export const bulkIndexDocuments = async <T extends HasIdentifier>(
  elasticClient: Client,
  index: string,
  documents: Observable<T>
): Promise<BulkIndexResult<T>> => {
  const datasource = observableToStream(documents);
  const failed: T[] = [];
  const result = await elasticClient.helpers.bulk<T>({
    datasource,
    onDocument(doc) {
      return {
        index: { _index: index, _id: doc.id },
      };
    },
    onDrop(failureObject) {
      log.info(
        failureObject.document.id,
        "was dropped during the bulk import:",
        failureObject
      );
      failed.push(failureObject.document);
    },
  });

  return {
    successful: result.successful,
    time: result.time,
    failed,
  };
};
