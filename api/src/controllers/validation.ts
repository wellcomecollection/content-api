import { z } from 'zod';

import { HttpError } from './error';

type NonEmptyArray<T> = [T, ...T[]];

const quoted = (str: string) => `'${str}'`;

// For listing items (no Oxford comma)
const readableList = (
  arr: readonly string[],
  conjunction: 'and' | 'or' = 'and'
): string => {
  if (arr.length === 0) {
    return '';
  }
  const quotes = arr.map(quoted);
  return arr.length > 1
    ? `${quotes.slice(0, -1).join(', ')} ${conjunction} ${
        quotes[quotes.length - 1]
      }`
    : quotes[0];
};

export const validateDate = (input: string): Date => {
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new HttpError({
      status: 400,
      label: 'Bad Request',
      description: `${quoted(
        input
      )} is not a valid date. Please specify a date or datetime in ISO 8601 format.`,
    });
  }
  return date;
};

export const looksLikePrismicId = (
  id: string | string[] | undefined
): id is string => (typeof id === 'string' ? /^[\w-]+$/.test(id) : false);

export const looksLikeWorkId = (
  id: string | string[] | undefined
): id is string => (typeof id === 'string' ? /^[a-zA-Z0-9]+$/.test(id) : false);

// ---- Zod-based helpers ----

/** Builds a Zod field for a comma-separated enum query param. */
export function commaSeparatedEnum<T extends string>(
  name: string,
  values: readonly [T, ...T[]],
  opts: { singleValue?: boolean; defaultValue?: T } = {}
) {
  return z
    .string()
    .optional()
    .transform((val, ctx): NonEmptyArray<T> | undefined => {
      if (val === undefined) {
        return opts.defaultValue ? [opts.defaultValue] : undefined;
      }
      const parts = val.split(',') as T[];
      const invalid = parts.filter(
        p => !(values as readonly string[]).includes(p)
      );
      if (invalid.length > 0 || parts.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: `${name}: ${readableList(invalid)} ${
            invalid.length === 1
              ? 'is not a valid value'
              : 'are not valid values'
          }. Please choose one of ${readableList(values, 'or')}`,
        });
        return z.NEVER;
      }
      if (opts.singleValue && parts.length > 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Only 1 value can be specified for ${name}`,
        });
        return z.NEVER;
      }
      return parts as NonEmptyArray<T>;
    });
}

/** Validates a comma-separated list of Prismic IDs */
export const commaSeparatedPrismicIds = (filterName: string) =>
  z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      const parts = val.split(',');
      const invalidValues = parts.filter(p => !looksLikePrismicId(p));
      if (invalidValues.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `At least one invalid value has been passed in the ${filterName} filter: ${
            invalidValues.length > 1
              ? invalidValues.join(', ')
              : invalidValues[0]
          }`,
        });
      }
    });

/** Full-text search query string, shared across list endpoints */
export const queryStringSchema = z
  .string()
  .optional()
  .meta({ description: 'Full-text search query' });

/** Validates a comma-separated string or repeated array of work IDs */
export const workIdsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .superRefine((val, ctx) => {
    if (val === undefined) return;
    const ids = Array.isArray(val) ? val : val.split(',').map(id => id.trim());
    for (const id of ids) {
      if (!looksLikeWorkId(id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid work ID format. Work IDs should only contain alphanumeric characters. Found: ${id}`,
        });
      }
    }
  })
  .meta({
    description:
      'Filter by linked catalogue work IDs. Accepts multiple work IDs via comma-separated values or repeated parameters.',
  });

// Matches YYYY-MM-DD where:
//   YYYY  — any 4-digit year
//   MM    — 01–12
//   DD    — 01–31 (does not validate days-in-month, e.g. 02-31 is accepted)
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** Validates a YYYY-MM-DD date string */
export const dateStringSchema = z
  .string()
  .optional()
  .superRefine((val, ctx) => {
    if (val === undefined) return;
    if (!DATE_REGEX.test(val)) {
      ctx.addIssue({
        code: 'custom',
        message: `${quoted(val)} is not a valid date. Please use YYYY-MM-DD format.`,
      });
    }
  });

/** Shared pagination params for all list endpoints */
export const PaginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'page: must be a number greater than or equal to 1')
    .optional()
    .meta({
      description: 'The page to return from the result list',
      minimum: 1,
      default: 1,
    }),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, 'pageSize: must be a number between 1 and 100')
    .max(100, 'pageSize: must be a number between 1 and 100')
    .optional()
    .meta({
      description: 'The number of results to return per page',
      minimum: 1,
      maximum: 100,
      default: 10,
    }),
});
