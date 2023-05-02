import { mockedApi } from "./fixtures/api";

describe("GET /articles/:id", () => {
  it("returns a document for the given ID", async () => {
    const testId = "123";
    const testDoc = { title: "test-article" };
    const api = mockedApi([{ id: testId, display: testDoc }]);

    const response = await api.get(`/articles/${testId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });

  it("returns a 404 if no document for the given ID exists", async () => {
    const api = mockedApi([]);

    const response = await api.get(`/articles/123`);
    expect(response.statusCode).toBe(404);
  });
});
