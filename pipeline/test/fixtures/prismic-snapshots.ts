import fs from "node:fs";
import path from "node:path";
import { test } from "@jest/globals";
import type { Global as JestGlobal } from "@jest/types";
import { ContentType } from "../../src/types";
import * as prismicT from "@prismicio/types";

// For prismic types which we do not make addressable but are included in our other documents
type NonAddressableContentType = "people";
type PrismicType = ContentType | NonAddressableContentType;

// Hold snapshots in memory rather than reading from the filesystem for every test
const snapshotCache = new Map<string, any>();
const prismicTypesCache = new Map<PrismicType, string[]>();

const dataDir = path.resolve(__dirname, "../prismic-snapshots");

const getSnapshot = <T>(name: string): T => {
  if (snapshotCache.has(name)) {
    return snapshotCache.get(name);
  }
  return JSON.parse(
    fs.readFileSync(path.resolve(dataDir, name), { encoding: "utf-8" })
  );
};

const snapshotNamesForContentType = (prismicType: PrismicType): string[] =>
  prismicTypesCache.get(prismicType) ??
  fs.readdirSync(dataDir).filter((f) => f.endsWith(`${prismicType}.json`));

export const getSnapshots = <T extends prismic.PrismicDocument>(
  ...prismicTypes: PrismicType[]
): T[] => prismicTypes.flatMap(snapshotNamesForContentType).map(getSnapshot<T>);

export const forEachPrismicSnapshot = <T extends prismic.PrismicDocument>(
  ...prismicTypes: PrismicType[]
) => {
  const snapshots = getSnapshots<T>(...prismicTypes);
  return <EachFn extends JestGlobal.TestFn | JestGlobal.BlockFn>(
    description: string,
    testCase: (snapshot: T) => ReturnType<EachFn>
  ) => test.each(snapshots)(`${description} (document: $type/$id)`, testCase);
};
