import fs from 'node:fs';
import path from 'node:path';

import { fetchedFields } from '@weco/content-pipeline/src/types/prismic';

type FetchedField = string | { id: string };
type LinkedDocument = { type: string; data: Record<string, unknown> };

const snapshotDirs = ['prismic-snapshots', 'prismic-snapshots/addressables'];

const isLinkedDocumentWithData = (value: unknown): value is LinkedDocument =>
  typeof value === 'object' &&
  value !== null &&
  'link_type' in value &&
  value.link_type === 'Document' &&
  'type' in value &&
  typeof value.type === 'string' &&
  'data' in value &&
  typeof value.data === 'object' &&
  value.data !== null;

/** Collects every linked document that came back with its `data`, at any depth. */
const findLinkedDocuments = (value: unknown): LinkedDocument[] => {
  if (isLinkedDocumentWithData(value)) {
    return [value, ...findLinkedDocuments(value.data)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(findLinkedDocuments);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(findLinkedDocuments);
  }
  return [];
};

const fieldName = (field: FetchedField) =>
  typeof field === 'string' ? field : field.id;

const snapshots = snapshotDirs.flatMap(dir => {
  const dirPath = path.resolve(__dirname, dir);
  return fs
    .readdirSync(dirPath)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: `${dir}/${file}`,
      document: JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf-8')),
    }));
});

describe('fetchedFields', () => {
  it('has snapshots to check against', () => {
    expect(snapshots.length).toBeGreaterThan(0);
  });

  test.each(snapshots)(
    'matches the linked documents fetched in $name',
    ({ document }) => {
      findLinkedDocuments(document.data).forEach(linked => {
        const expected =
          fetchedFields[linked.type as keyof typeof fetchedFields];

        expect({ type: linked.type, known: expected !== undefined }).toEqual({
          type: linked.type,
          known: true,
        });
        // Prismic leaves out fields that are empty, so we only check for extra ones
        const unexpected = Object.keys(linked.data).filter(
          key =>
            !(expected as readonly FetchedField[]).map(fieldName).includes(key)
        );
        expect(unexpected).toEqual([]);
      });
    }
  );
});
