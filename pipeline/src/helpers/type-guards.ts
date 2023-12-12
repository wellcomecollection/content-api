import * as prismic from "@prismicio/client";
import { DataInterface, PrismicImage } from "../types/prismic";

export function isNotUndefined<T>(val: T | undefined): val is T {
  return typeof val !== "undefined";
}

function isString(v: any): v is string {
  return typeof v === "string";
}

// Prismic often returns empty RichText fields as `[]`, this filters them out

/** Here we have wrappers for `KeyTextField` and `RichTextField`.
 *
 * We prefer these to the versions provided by the prismic-helpers library because
 * they add extra validation steps, e.g. removing stray whitespace or null values.
 */
export function asText(
  field: prismic.KeyTextField | prismic.RichTextField
): string | undefined {
  if (isString(field)) {
    // KeyTextField
    return field.trim().length > 0 ? field.trim() : undefined;
  } else {
    // RichTextField
    const output =
      field && field.length > 0 ? prismic.asText(field).trim() : undefined;
    return output && output.length > 0 ? output : undefined;
  }
}

export function asTitle(title: prismic.RichTextField): string {
  // We always need a title - blunt validation, but validation none the less
  return asText(title) || "";
}

export function isFilledLinkToDocument<T, L, D extends DataInterface>(
  field: prismic.ContentRelationshipField<T, L, D> | undefined
): field is prismic.FilledContentRelationshipField<T, L, D> {
  return isNotUndefined(field) && "id" in field && field.isBroken === false;
}

export function isFilledLinkToDocumentWithData<T, L, D extends DataInterface>(
  field: prismic.ContentRelationshipField<T, L, D> | undefined
): field is prismic.FilledContentRelationshipField<T, L, D> & {
  data: DataInterface;
} {
  return isFilledLinkToDocument(field) && "data" in field;
}

// When the Prismic image field is empty (of type EmptyImageFieldImage),
// it does not have a dimensions object.
export function isImageLink(
  maybeImage: prismic.EmptyImageFieldImage | PrismicImage | undefined
): maybeImage is PrismicImage {
  return Boolean(maybeImage && maybeImage.dimensions);
}
