import { queryValidator } from "../src/controllers/validation";

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
