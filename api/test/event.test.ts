import { mockedApi } from "./fixtures/api";

describe("GET /events/:id", () => {
  it("returns a document for the given ID", async () => {
    const testId = "abc";
    const testDoc = { title: "test-event" };
    const api = mockedApi([{ id: testId, display: testDoc }]);

    const response = await api.get(`/events/${testId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });

  it("returns a 404 if no document for the given ID exists", async () => {
    const api = mockedApi([]);

    const response = await api.get(`/events/abc`);
    expect(response.statusCode).toBe(404);
  });
});
