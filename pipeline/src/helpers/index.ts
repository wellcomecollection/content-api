import { KeyTextField, RichTextField } from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";

export function isNotUndefined<T>(val: T | undefined): val is T {
  return typeof val !== "undefined";
}

export function isString(v: any): v is string {
  return typeof v === "string";
}

// Prismic often returns empty RichText fields as `[]`, this filters them out

/** Here we have wrappers for `KeyTextField` and `RichTextField`.
 *
 * We prefer these to the versions provided by the prismic-helpers library because
 * they add extra validation steps, e.g. removing stray whitespace or null values.
 */
export function asText(
  field: KeyTextField | RichTextField
): string | undefined {
  if (isString(field)) {
    // KeyTextField
    return field.trim().length > 0 ? field.trim() : undefined;
  } else {
    // RichTextField
    const output =
      field && field.length > 0 ? prismicH.asText(field).trim() : undefined;
    return output && output.length > 0 ? output : undefined;
  }
}

export function asTitle(title: RichTextField): string {
  // We always need a title - blunt validation, but validation none the less
  return asText(title) || "";
}
