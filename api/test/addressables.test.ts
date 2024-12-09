import { mockedApi } from './fixtures/api';

describe('GET /all', () => {
  it('returns a list of documents', async () => {
    const docs = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test doc ${i}`,
      },
    }));
    const api = mockedApi(docs);

    const response = await api.get(`/all`);
    expect(response.statusCode).toBe(200);
    console.log(response.body.results);
    expect(response.body.results).toStrictEqual(docs.map(d => d.display));
  });
});
