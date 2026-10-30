/**
 * A type with every field optional, so that a Prismic document fetched with a
 * graph query (which only returns some of its fields) can be checked against
 * the type for the fields it does have.
 *
 * The index signature stops TypeScript rejecting a slice with no fields in
 * common with the type, which happens because it adds `field?: undefined` to
 * the slices that lack a field another slice in the same array has.
 *
 * Empty content relationships are typed so they can't match a populated link,
 * which keeps the linked document's data checked.
 *
 * Slices aren't checked as strictly: JSON imports widen `slice_type` to `string`
 * and merge the slices in an array into one shape, so a wrong value in a slice's
 * field can match another slice type's `unknown` extras.
 */
export type Loose<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Loose<U>[]
        : T extends { link_type: 'Any' }
          ? { link_type?: string; id?: undefined; data?: undefined }
          : T extends object
            ? { [K in keyof T]?: Loose<T[K]> } & { [key: string]: unknown }
            : T;
