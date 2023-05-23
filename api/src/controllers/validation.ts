import { HttpError } from "./error";
import { isInSet, not } from "../helpers";
import { StringLiteral } from "../types";

type NonEmptyArray<T> = [T, ...T[]];

type QueryValidatorConfig<Name, AllowedValue> = {
  name: StringLiteral<Name>;
  allowed: ReadonlyArray<StringLiteral<AllowedValue>>;
  defaultValue?: Readonly<StringLiteral<AllowedValue>>;
  singleValue?: boolean;
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
    const providedValues = query[name]?.split(",");
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
          ? "is not a valid value"
          : "are not valid values";
      throw new HttpError({
        status: 400,
        label: "Bad Request",
        description: `${name}: ${readableList(
          invalidValues
        )} ${invalidMessage}. Please choose one of ${readableList(
          allowed,
          "or"
        )}`,
      });
    }

    if (singleValue && validValues.length > 1) {
      throw new HttpError({
        status: 400,
        label: "Bad Request",
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
      label: "Bad Request",
      description: `${quoted(
        input
      )} is not a valid date. Please specify a date or datetime in ISO 8601 format.`,
    });
  }
  return date;
};

const quoted = (str: string) => `'${str}'`;

// For listing items (no Oxford comma)
const readableList = (
  arr: readonly string[],
  conjunction: "and" | "or" = "and"
): string => {
  if (arr.length === 0) {
    return "";
  }
  const quotes = arr.map(quoted);
  return arr.length > 1
    ? `${quotes.slice(0, -1).join(", ")} ${conjunction} ${
        quotes[quotes.length - 1]
      }`
    : quotes[0];
};
