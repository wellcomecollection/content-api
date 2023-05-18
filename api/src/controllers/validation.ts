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
