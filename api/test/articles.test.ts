import { mockedApi } from './fixtures/api';

describe('GET /articles', () => {
  it('returns a list of documents', async () => {
    const docs = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test doc ${i}`,
      },
    }));
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/articles`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toStrictEqual(docs.map(d => d.display));
  });

  it('accepts linkedWork parameter', async () => {
    const docs = [
      {
        id: 'article-1',
        display: { title: 'Article with works' },
      },
    ];
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/articles?linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('returns 400 for invalid linkedWork format', async () => {
    const { agent } = mockedApi([]);

    const response = await agent.get(`/articles?linkedWork=invalid-work-id!`);
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid work ID format');
  });

  it('accepts both query and linkedWork parameters', async () => {
    const docs = [
      {
        id: 'article-1',
        display: { title: 'Health article' },
      },
    ];
    const { agent } = mockedApi(docs);

    const response = await agent.get(
      `/articles?query=health&linkedWork=work123`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('accepts multiple linkedWork parameters', async () => {
    const docs = [
      {
        id: 'article-1',
        display: { title: 'Article with multiple works' },
      },
    ];
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/articles?linkedWork=work123,work456`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });
});
