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
const prismicTypesCache = new Map<PrismicType, string[]>();

const dataDir = (isAddressable?: boolean) =>
  path.resolve(
    __dirname,
    `../prismic-snapshots${isAddressable ? `/addressables` : ''}`
  );

const getSnapshot = <T>(name: string, isAddressable?: boolean): T => {
  if (snapshotCache.has(name)) {
    return snapshotCache.get(name);
  }
  return JSON.parse(
    fs.readFileSync(path.resolve(dataDir(isAddressable), name), {
      encoding: 'utf-8',
    })
  );
};

const snapshotNamesForContentType = (
  prismicType: PrismicType,
  isAddressable?: boolean
): string[] =>
  prismicTypesCache.get(prismicType) ??
  fs
    .readdirSync(dataDir(isAddressable))
    .filter(f => f.endsWith(`${prismicType}.json`));

export const getSnapshots = <T extends prismic.PrismicDocument>(
  prismicTypes: PrismicType[],
  isAddressable?: boolean
): T[] =>
  prismicTypes
    .flatMap(pt => snapshotNamesForContentType(pt, isAddressable))
    .map(name => getSnapshot<T>(name, isAddressable));

export const forEachPrismicSnapshot = <T extends prismic.PrismicDocument>(
  prismicTypes: PrismicType[],
  isAddressable?: boolean
) => {
  const snapshots = getSnapshots<T>(prismicTypes, isAddressable);
  return <EachFn extends JestGlobal.TestFn | JestGlobal.BlockFn>(
    description: string,
    testCase: (snapshot: T) => ReturnType<EachFn>
  ) => test.each(snapshots)(`${description} (document: $type/$id)`, testCase);
};
