import { Client, errors as elasticErrors } from '@elastic/elasticsearch';
import {
  IndicesIndexSettings,
  MappingTypeMapping,
} from '@elastic/elasticsearch/lib/api/types';
import {
  bufferCount,
  from,
  map,
  mergeMap,
  Observable,
  OperatorFunction,
  pipe,
} from 'rxjs';

import log from '@weco/content-common/services/logging';

import { observableToStream } from './observableToStream';

const BULK_BATCH_SIZE = 1000;

export type IndexConfig = {
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
    if (
      e instanceof elasticErrors.ResponseError &&
      e.message.includes('resource_already_exists_exception')
    ) {
      log.info(`Index '${indexConfig.index}' already exists`);
      // make sure the index mapping is up-to-date
      await elasticClient.indices.putMapping({
        index: indexConfig.index,
        ...indexConfig.mappings,
      });
    } else {
      throw e;
    }
  }
};

export type HasIdentifier = {
  id: string;
};

type BulkIndexResult = {
  successfulIds: Set<string>;
  time: number;
};

export const bulkIndexDocuments = async <T extends HasIdentifier>(
  elasticClient: Client,
  index: string,
  documents: Observable<T>
): Promise<BulkIndexResult> => {
  const datasource = observableToStream(documents);
  const successfulIds = new Set<string>();
  const failed: T[] = [];
  const result = await elasticClient.helpers.bulk<T>({
    datasource,
    onDocument(doc) {
      successfulIds.add(doc.id);
      return {
        index: { _index: index, _id: doc.id },
      };
    },
    onDrop(failureObject) {
      log.warn(
        `${failureObject.document.id} was dropped during the bulk import: ${failureObject.error?.reason}`
      );
      successfulIds.delete(failureObject.document.id);
      failed.push(failureObject.document);
    },
  });

  if (failed.length !== 0) {
    throw new Error(`Bulk index of ${failed.length} documents failed`);
  }

  return {
    time: result.time,
    successfulIds,
  };
};

type ParentDocumentIdsConfig = {
  index: string;
  identifiersField: string;
  batchSize?: number;
};

export const getParentDocumentIDs = <T extends { id: string }>(
  elasticClient: Client,
  {
    index,
    identifiersField,
    batchSize = BULK_BATCH_SIZE,
  }: ParentDocumentIdsConfig
): OperatorFunction<T, string> =>
  pipe(
    map(doc => doc.id),
    bufferCount(batchSize),
    mergeMap(maybeChildIds => {
      const scroll = elasticClient.helpers.scrollDocuments<HasIdentifier>({
        index,
        // If _source is falsy, which should work from a pure ES perspective, the helper returns
        // an empty iterable: as we're already stating that we're scrolling `HasIdentifier`s, we're
        // safe to specify that the documents have `id`s in their sources.
        _source: ['id'],
        query: {
          terms: {
            [identifiersField]: maybeChildIds,
          },
        },
      });

      return from(scroll).pipe(map(doc => doc.id));
    })
  );
