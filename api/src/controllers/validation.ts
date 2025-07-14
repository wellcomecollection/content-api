import { isInSet, not } from '@weco/content-api/src/helpers';
import { StringLiteral } from '@weco/content-api/src/types';

import { HttpError } from './error';

type NonEmptyArray<T> = [T, ...T[]];

type QueryValidatorConfig<Name, AllowedValue> = {
  name: StringLiteral<Name>;
  allowed: readonly StringLiteral<AllowedValue>[];
  defaultValue?: Readonly<StringLiteral<AllowedValue>>;
  singleValue?: boolean;
};

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

export const queryValidator = <Name, AllowedValue>({
  name,
  allowed,
  defaultValue,
  singleValue,
}: QueryValidatorConfig<Name, AllowedValue>) => {
  const allowedSet = new Set(allowed);
  return <Query extends { [key in typeof name]?: string }>(
    query: Query
  ): NonEmptyArray<AllowedValue> | undefined => {
    const providedValues = query[name]?.split(',');
    if (providedValues === undefined) {
      return defaultValue === undefined ? undefined : [defaultValue];
    }

    const validValues = providedValues.filter(isInSet(allowedSet));
    if (
      validValues.length !== providedValues.length ||
      validValues.length === 0
    ) {
      const invalidValues = providedValues.filter(not(isInSet(allowedSet)));
      const invalidMessage =
        invalidValues.length === 1
          ? 'is not a valid value'
          : 'are not valid values';
      throw new HttpError({
        status: 400,
        label: 'Bad Request',
        description: `${name}: ${readableList(
          invalidValues
        )} ${invalidMessage}. Please choose one of ${readableList(
          allowed,
          'or'
        )}`,
      });
    }

    if (singleValue && validValues.length > 1) {
      throw new HttpError({
        status: 400,
        label: 'Bad Request',
        description: `Only 1 value can be specified for ${name}`,
      });
    }

    return validValues as NonEmptyArray<AllowedValue>;
  };
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

function isString(v: unknown): v is string {
  return typeof v === 'string';
}
// From looksLikePrismicId in .org repo:
// \w: Matches any word character (alphanumeric & underscore).
// Only matches low-ascii characters (no accented or non-roman characters).
// Equivalent to [A-Za-z0-9_].
// Added "-" to be matched as well.
// + means empty strings will return false.
export const looksLikePrismicId = (
  id: string | string[] | undefined
): id is string => (isString(id) ? /^[\w-]+$/.test(id) : false);

export const prismicIdValidator = (
  filterValues: string,
  filterName: string
) => {
  const filterValuesArray = filterValues.split(',');
  const invalidValues: string[] = [];

  filterValuesArray.forEach(filterValue => {
    if (!looksLikePrismicId(filterValue)) {
      invalidValues.push(filterValue);
    }
  });

  if (invalidValues.length > 0)
    throw new HttpError({
      status: 400,
      label: 'Bad Request',
      description: `At least one invalid value has been passed in the ${filterName} filter: ${invalidValues.length > 1 ? invalidValues.join(', ') : invalidValues}`,
    });
};

// Checks if the date is of the format YYYY-MM-DD
export const dateValidator = (date: string) => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  if (!dateRegex.test(date))
    throw new HttpError({
      status: 400,
      label: 'Bad Request',
      description: `${date} is not a valid YYYY-MM-DD format.`,
    });
};
