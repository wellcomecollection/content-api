import * as prismic from "@prismicio/client";
import { isNotUndefined } from ".";
import { DataInterface } from "../types";

export function isFilledLinkToDocument<T, L, D extends DataInterface>(
  field: prismic.RelationField<T, L, D> | undefined
): field is prismic.FilledLinkToDocumentField<T, L, D> {
  return isNotUndefined(field) && "id" in field && field.isBroken === false;
}

export function isFilledLinkToDocumentWithData<T, L, D extends DataInterface>(
  field: prismic.RelationField<T, L, D> | undefined
): field is prismic.FilledLinkToDocumentField<T, L, D> & { data: DataInterface } {
  return isFilledLinkToDocument(field) && "data" in field;
}
