import fs from "node:fs";
import path from "node:path";
import { test } from "@jest/globals";
import type { Global as JestGlobal } from "@jest/types";
import { ContentType } from "../../src/types";
import { PrismicDocument } from "@prismicio/types";

// Hold snapshots in memory rather than reading from the filesystem for every test
const snapshotCache = new Map<string, any>();
const contentTypesCache = new Map<ContentType, string[]>();

const dataDir = path.resolve(__dirname, "../prismic-snapshots");

const getSnapshot = <T>(name: string): T => {
  if (snapshotCache.has(name)) {
    return snapshotCache.get(name);
  }
  return JSON.parse(
    fs.readFileSync(path.resolve(dataDir, name), { encoding: "utf-8" })
  );
};

const snapshotNamesForContentType = (contentType: ContentType): string[] =>
  contentTypesCache.get(contentType) ??
  fs.readdirSync(dataDir).filter((f) => f.endsWith(`${contentType}.json`));

export const getSnapshots = <T extends PrismicDocument>(
  ...contentTypes: ContentType[]
): T[] => contentTypes.flatMap(snapshotNamesForContentType).map(getSnapshot<T>);

export const forEachPrismicSnapshot = <T extends PrismicDocument>(
  ...contentTypes: ContentType[]
) => {
  const snapshots = getSnapshots<T>(...contentTypes);
  return <EachFn extends JestGlobal.TestFn | JestGlobal.BlockFn>(
    description: string,
    testCase: (snapshot: T) => ReturnType<EachFn>
  ) => test.each(snapshots)(`${description} (document: $type/$id)`, testCase);
};
