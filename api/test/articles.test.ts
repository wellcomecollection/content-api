import { mockedApi } from './fixtures/api';

describe('GET /articles', () => {
  it('returns a list of documents', async () => {
    const docs = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test doc ${i}`,
      },
    }));
    const api = mockedApi(docs);

    const response = await api.get(`/articles`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toStrictEqual(docs.map(d => d.display));
  });
});
