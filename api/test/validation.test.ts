import { queryValidator, validateDate } from "../src/controllers/validation";

describe("query validator", () => {
  const testValidator = queryValidator({
    name: "test",
    defaultValue: "a",
    allowed: ["a", "b"],
  });
  it("extracts allowed values from query parameters", () => {
    expect(testValidator({ test: "a" })).toBe("a");
    expect(testValidator({ test: "b" })).toBe("b");
  });

  it("rejects values which are not in the allowlist", () => {
    expect(() =>
      testValidator({ test: "123" })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Bad Request: test: '123' is not a valid value. Please choose one of: 'a', 'b'"`
    );
  });

  it("returns a given default value when the parameter is undefined", () => {
    expect(testValidator({ test: undefined })).toBe("a");
  });
});

describe("validateDate", () => {
  it("parses strings that are valid dates", () => {
    expect(validateDate("2022-02-22")).toBeValidDate();
  });

  it("rejects dates that can't be parsed", () => {
    expect(() =>
      validateDate("A few weeks ago")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Bad Request: 'A few weeks ago' is not a valid date. Please specify a date or datetime in ISO 8601 format."`
    );
  });
});
