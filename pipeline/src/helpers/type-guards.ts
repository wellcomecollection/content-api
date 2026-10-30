import * as prismic from '@prismicio/client';

import { PrismicImage } from '@weco/content-pipeline/src/types/prismic';

export function isNotUndefined<T>(val: T | undefined): val is T {
  return typeof val !== 'undefined';
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/**
 * Wrapper for `KeyTextField` and `RichTextField` that returns the trimmed text,
 * or `undefined` if the field is empty. Prismic often returns empty RichText
 * fields as `[]`, which this filters out.
 *
 * We prefer this to the version provided by the prismic-helpers library because
 * that only handles rich text, and returns null or untrimmed text for empty fields.
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

/** The text of a title field, or an empty string, as we always need a title. */
export function asTitle(title: prismic.RichTextField): string {
  return asText(title) || '';
}

/** Any content relationship field, whatever its document types and fetched data. */
type AnyContentRelationshipField = prismic.ContentRelationshipField<
  string,
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/** The filled (non-empty) members of a content relationship field type. */
type FilledLink<F> = Extract<F, { id: string }>;

/**
 * Checks that a content relationship field points at an existing document,
 * i.e. it is neither empty nor broken.
 */
export function isFilledLinkToDocument<F extends AnyContentRelationshipField>(
  field: F | undefined
): field is FilledLink<F> {
  const link: AnyContentRelationshipField | undefined = field;
  return isNotUndefined(link) && 'id' in link && link.isBroken === false;
}

/**
 * Checks that a content relationship field points at an existing document
 * and that the document's fetched `data` is present.
 */
export function isFilledLinkToDocumentWithData<
  F extends AnyContentRelationshipField,
>(
  field: F | undefined
): field is FilledLink<F> & { data: NonNullable<FilledLink<F>['data']> } {
  return isFilledLinkToDocument(field) && 'data' in field;
}

/**
 * Checks that a Prismic image field is filled.
 * An empty image field (`EmptyImageFieldImage`) has no `dimensions` object.
 */
export function isImageLink(
  maybeImage: prismic.EmptyImageFieldImage | PrismicImage | undefined
): maybeImage is PrismicImage {
  return Boolean(maybeImage && maybeImage.dimensions);
}
