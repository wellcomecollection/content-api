import fs from 'node:fs';
import path from 'node:path';

import { fetchedFields } from '@weco/content-pipeline/src/types/prismic';

type FetchedField =
  | string
  | {
      id: string;
      fields?: readonly FetchedField[];
      customtypes?: readonly { id: string; fields: readonly FetchedField[] }[];
    };
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Returns the paths of any keys in `data` that the descriptors don't declare,
 * following group items and linked documents into their own descriptors.
 * Prismic leaves out fields that are empty, so we only check for extra ones.
 */
const findUnexpectedKeys = (
  data: Record<string, unknown>,
  descriptors: readonly FetchedField[],
  prefix = ''
): string[] =>
  Object.entries(data).flatMap(([key, value]) => {
    const descriptor = descriptors.find(d => fieldName(d) === key);
    if (descriptor === undefined) return [`${prefix}${key}`];
    if (typeof descriptor === 'string') return [];

    const { fields, customtypes } = descriptor;
    if (fields && Array.isArray(value)) {
      return value
        .filter(isRecord)
        .flatMap(item => findUnexpectedKeys(item, fields, `${prefix}${key}.`));
    }
    if (customtypes && isLinkedDocumentWithData(value)) {
      const customtype = customtypes.find(c => c.id === value.type);
      return customtype
        ? findUnexpectedKeys(value.data, customtype.fields, `${prefix}${key}.`)
        : [`${prefix}${key} (${value.type})`];
    }
    return [];
  });

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
        expect(
          findUnexpectedKeys(linked.data, expected as readonly FetchedField[])
        ).toEqual([]);
      });
    }
  );
});
