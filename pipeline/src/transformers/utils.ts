import * as prismic from '@prismicio/client';

import { Series } from '@weco/content-common/types/eventDocument';
import {
  asText,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { WithSeries } from '@weco/content-pipeline/src/types/prismic';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

/** A link to a Prismic document that may include the document's fetched `data`. */
type LinkedDocumentWithData = {
  link_type: 'Document';
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

/**
 * Checks for a link to a document that came back with its `data`, so that we
 * pick up linked documents but not slices.
 */
const isLinkedDocumentWithData = (
  obj: JsonObject
): obj is LinkedDocumentWithData =>
  obj.link_type === 'Document' && 'id' in obj && 'data' in obj;

/**
 * The ids of all the linked documents, at any depth, that came back with
 * their `data` in a Prismic document.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const linkedDocumentIdentifiers = (rootDocument: any): string[] => {
  const getLinkedIdentifiers = (
    root: JsonValue,
    identifiers: Set<string>
  ): Set<string> => {
    const descend = (arr: JsonValue[]) =>
      new Set(
        ...arr.flatMap(nextRoot => getLinkedIdentifiers(nextRoot, identifiers))
      );

    if (typeof root === 'object') {
      if (root === null) {
        return identifiers;
      } else if (Array.isArray(root)) {
        return descend(root);
      } else if (isLinkedDocumentWithData(root)) {
        return identifiers.add(root.id);
      } else {
        return descend(Object.values(root));
      }
    } else {
      return identifiers;
    }
  };

  return Array.from(getLinkedIdentifiers(rootDocument, new Set<string>()));
};

/**
 * The series a document belongs to, with each series' title and the names of
 * its contributors. Links that are empty, broken or have no fetched data are left out.
 */
export const transformSeries = (document: { data: WithSeries }): Series => {
  return document.data.series.flatMap(({ series }) =>
    isFilledLinkToDocumentWithData(series)
      ? {
          id: series.id,
          title: asText(series.data.title),
          contributors: series.data.contributors
            ? [...series.data.contributors]
                .flatMap(({ contributor }) =>
                  isFilledLinkToDocumentWithData(contributor)
                    ? asText(contributor.data.name)
                    : []
                )
                .filter(isNotUndefined)
            : [],
        }
      : []
  );
};

/** The caption of the first image in a promo slice zone, if it has one. */
export function primaryImageCaption(
  promo?: prismic.SliceZone<
    prismic.Slice<string, { caption: prismic.RichTextField }>
  >
) {
  const primaryImage = promo?.[0]?.primary;
  return primaryImage?.caption && asText(primaryImage.caption);
}

/** The text of each node in a rich text field that has text, e.g. one entry per paragraph. */
export const richTextLines = (field: prismic.RichTextField | undefined) =>
  (field ?? []).flatMap(node => ('text' in node ? [node.text] : []));

/**
 * The rich text lines of every slice that has a `text` field, optionally
 * limited to some slice types. `undefined` if there are no slices.
 */
export const sliceTextLines = (
  slices: readonly { slice_type: string; primary: object }[] | undefined,
  sliceTypes?: string[]
) =>
  slices?.flatMap(slice =>
    (!sliceTypes || sliceTypes.includes(slice.slice_type)) &&
    'text' in slice.primary &&
    Array.isArray(slice.primary.text)
      ? richTextLines(slice.primary.text as prismic.RichTextField)
      : []
  );
