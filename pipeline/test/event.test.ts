import { toBoundedWindow } from "@weco/content-pipeline/src/event";

describe("time window events", () => {
  describe("toBoundedWindow", () => {
    it("adds an end to an event with a start and a duration", () => {
      const event = {
        contentType: "all",
        start: "2022-02-22T22:22:22.222Z",
        duration: "1 hour",
      } as const;
      const result = toBoundedWindow(event);

      expect(result.end).toBeDefined();
      expect(result.end!.getTime() - result.start!.getTime()).toBe(
        60 * 60 * 1000,
      );
    });

    it("adds a start to an event with an end and a duration", () => {
      const event = {
        contentType: "all",
        end: "2022-02-22T22:22:22.222Z",
        duration: "1 minute",
      } as const;
      const result = toBoundedWindow(event);

      expect(result.start).toBeDefined();
      expect(result.end!.getTime() - result.start!.getTime()).toBe(60 * 1000);
    });

    it("errors when a duration is given without a start or end", () => {
      const event = {
        contentType: "all",
        duration: "40 days",
      } as const;

      expect(() => toBoundedWindow(event)).toThrowErrorMatchingInlineSnapshot(
        `"Window duration must be specified alongside a start or end time"`,
      );
    });

    it("does not error when parameters are undefined", () => {
      expect(
        toBoundedWindow({
          contentType: "all",
        }),
      ).toEqual({
        start: undefined,
        end: undefined,
      });
      expect(() =>
        toBoundedWindow({
          start: "2022-02-22T22:22:22.222Z",
          contentType: "all",
        }),
      ).not.toThrow();
      expect(() =>
        toBoundedWindow({
          end: "2022-02-22T22:22:22.222Z",
          contentType: "all",
        }),
      ).not.toThrow();
    });

    it("does not error when parameters are malformed", () => {
      const malformedEvent = {
        contentType: "all",
        start: "Fairly recently",
        end: "Quite a while ago",
      } as const;
      expect(() => toBoundedWindow(malformedEvent)).not.toThrow();
      expect(toBoundedWindow(malformedEvent)).toEqual({
        start: undefined,
        end: undefined,
      });
    });
  });
});
