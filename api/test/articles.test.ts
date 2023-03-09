import { article } from "./fixtures/articles";
// import { mockedApi } from "./fixtures/api";

describe("GET /articles", () => {
  it("returns a list of articles", async () => {
    const testArticles = Array.from({ length: 10 }).map((_, i) =>
      article({ id: i.toString() })
    );
    // const api = mockedApi(testArticles, {});

    // const response = await api.get("/articles");
    // expect(response.statusCode).toBe(200);
    // expect(response.body.results).toStrictEqual(testArticles);
  });
});
