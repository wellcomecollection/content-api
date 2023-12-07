import { PrismicDocument } from "@prismicio/client";
import {
  isFilledLinkToDocumentWithData,
  asText,
  isNotUndefined,
} from "../helpers/type-guards";
import { WithSeries } from "../types/prismic/series";
import { QuerySeries } from "../types/transformed";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

type LinkedDocumentWithData = {
  link_type: "Document";
  id: string;
  data?: any;
};

// We want to extract IDs only from linked documents (not slices) from which
// we have denormalised some `data`
const isLinkedDocumentWithData = (
  obj: JsonObject
): obj is LinkedDocumentWithData =>
  obj["link_type"] === "Document" && "id" in obj && "data" in obj;

export const linkedDocumentIdentifiers = (rootDocument: any): string[] => {
  const getLinkedIdentifiers = (
    root: JsonValue,
    identifiers: Set<string>
  ): Set<string> => {
    const descend = (arr: JsonValue[]) =>
      new Set(
        ...arr.flatMap((nextRoot) =>
          getLinkedIdentifiers(nextRoot, identifiers)
        )
      );

    if (typeof root === "object") {
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

export const formatSeriesForQuery = (
  document: PrismicDocument<WithSeries>
): QuerySeries => {
  return document.data.series.flatMap(({ series }) =>
    isFilledLinkToDocumentWithData(series)
      ? {
          id: series.id,
          title: asText(series.data.title),
          contributors: series.data.contributors
            .flatMap(({ contributor }) =>
              isFilledLinkToDocumentWithData(contributor)
                ? asText(contributor.data.name)
                : []
            )
            .filter(isNotUndefined),
        }
      : []
  );
};
