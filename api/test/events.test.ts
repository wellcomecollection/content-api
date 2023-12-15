import { mockedApi } from "./fixtures/api";

describe("GET /events", () => {
  it("returns a list of events", async () => {
    const events = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test event ${i}`,
      },
    }));
    const api = mockedApi(events);

    const response = await api.get(`/events`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toStrictEqual(events.map((x) => x.display));
  });
});
