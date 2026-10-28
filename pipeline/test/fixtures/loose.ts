/**
 * A type with every field optional, so that a Prismic document fetched with a
 * graph query (which only returns some of its fields) can be checked against
 * the type for the fields it does have.
 *
 * The index signature stops TypeScript rejecting a slice with no fields in
 * common with the type, which happens because it adds `field?: undefined` to
 * the slices that lack a field another slice in the same array has.
 */
export type Loose<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Loose<U>[]
        : T extends object
          ? { [K in keyof T]?: Loose<T[K]> } & { [key: string]: unknown }
          : T;
