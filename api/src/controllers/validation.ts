import { HttpError } from "./error";
import { isInArray } from "../helpers";

type StringLiteral<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;

type QueryValidatorConfig<Name, AllowedValue> = {
  name: StringLiteral<Name>;
  defaultValue: Readonly<StringLiteral<AllowedValue>>;
  allowed: ReadonlyArray<StringLiteral<AllowedValue>>;
};

export const queryValidator =
  <Name, AllowedValue>({
    name,
    defaultValue,
    allowed,
  }: QueryValidatorConfig<Name, AllowedValue>) =>
  <Query extends { [key in typeof name]?: AllowedValue | string }>(
    query: Query
  ): AllowedValue => {
    const value: AllowedValue | string | undefined = query[name];
    if (typeof value === "undefined") {
      return defaultValue;
    } else if (isInArray(value, allowed)) {
      return value;
    } else {
      throw new HttpError({
        status: 400,
        label: "Bad Request",
        description:
          `${name}: '${value}' is not a valid value. Please choose one of: ` +
          allowed.map((s) => `'${s}'`).join(", "),
      });
    }
  };

export const validateDate = (input: string): Date => {
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new HttpError({
      status: 400,
      label: "Bad Request",
      description: `'${input}' is not a valid date. Please specify a date or datetime in ISO 8601 format.`,
    });
  }
  return date;
};
