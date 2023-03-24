import { FilledLinkToDocumentField, RelationField } from "@prismicio/types";
import { isNotUndefined } from ".";
import { DataInterface } from "../types";

export function isFilledLinkToDocument<T, L, D extends DataInterface>(
  field: RelationField<T, L, D> | undefined
): field is FilledLinkToDocumentField<T, L, D> {
  return isNotUndefined(field) && "id" in field && field.isBroken === false;
}

export function isFilledLinkToDocumentWithData<T, L, D extends DataInterface>(
  field: RelationField<T, L, D> | undefined
): field is FilledLinkToDocumentField<T, L, D> & { data: DataInterface } {
  return isFilledLinkToDocument(field) && "data" in field;
}
