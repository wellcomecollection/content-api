import { test } from '@jest/globals';
import type { Global as JestGlobal } from '@jest/types';
import * as prismic from '@prismicio/client';
import fs from 'node:fs';
import path from 'node:path';

import { ContentType } from '@weco/content-pipeline/src/types/prismic';

// For prismic types which we do not make addressable but are included in our other documents
type NonAddressableContentType = 'people';
type PrismicType = ContentType | NonAddressableContentType;

// Hold snapshots in memory rather than reading from the filesystem for every test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const snapshotCache = new Map<string, any>();
const prismicypesCache = new Map<PrismicType, string[]>();

const dataDir = path.resolve(__dirname, '../prismic-snapshots');

const getSnapshot = <T>(name: string): T => {
  if (snapshotCache.has(name)) {
    return snapshotCache.get(name);
  }
  return JSON.parse(
    fs.readFileSync(path.resolve(dataDir, name), { encoding: 'utf-8' })
  );
};

const snapshotNamesForContentType = (prismicype: PrismicType): string[] =>
  prismicypesCache.get(prismicype) ??
  fs.readdirSync(dataDir).filter(f => f.endsWith(`${prismicype}.json`));

export const getSnapshots = <T extends prismic.PrismicDocument>(
  ...prismicypes: PrismicType[]
): T[] => prismicypes.flatMap(snapshotNamesForContentType).map(getSnapshot<T>);

export const forEachPrismicSnapshot = <T extends prismic.PrismicDocument>(
  ...prismicypes: PrismicType[]
) => {
  const snapshots = getSnapshots<T>(...prismicypes);
  return <EachFn extends JestGlobal.TestFn | JestGlobal.BlockFn>(
    description: string,
    testCase: (snapshot: T) => ReturnType<EachFn>
  ) => test.each(snapshots)(`${description} (document: $type/$id)`, testCase);
};
