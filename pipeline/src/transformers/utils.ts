import { PrismicDocument } from '@prismicio/client';

import {
  asText,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { PromoSliceZone } from '@weco/content-pipeline/src/types/prismic';
import { WithSeries } from '@weco/content-pipeline/src/types/prismic/series';
import { Series } from '@weco/content-pipeline/src/types/transformed';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

type LinkedDocumentWithData = {
  link_type: 'Document';
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

// We want to extract IDs only from linked documents (not slices) from which
// we have denormalised some `data`
const isLinkedDocumentWithData = (
  obj: JsonObject
): obj is LinkedDocumentWithData =>
  obj.link_type === 'Document' && 'id' in obj && 'data' in obj;

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

export const transformSeries = (
  document: PrismicDocument<WithSeries>
): Series => {
  return document.data.series.flatMap(({ series }) =>
    isFilledLinkToDocumentWithData(series)
      ? {
          id: series.id,
          title: asText(series.data.title),
          contributors: series.data.contributors
            ? series.data.contributors
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

export function primaryImageCaption(promo?: PromoSliceZone) {
  const primaryImage = promo?.[0]?.primary;
  return primaryImage?.caption && asText(primaryImage.caption);
}
