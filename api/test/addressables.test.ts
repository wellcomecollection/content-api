import { mockedApi } from './fixtures/api';

describe('GET /all', () => {
  it('returns a list of documents', async () => {
    const docs = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test doc ${i}`,
      },
    }));
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/all`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toStrictEqual(docs.map(d => d.display));
  });

  it('accepts linkedWork parameter', async () => {
    const docs = [
      {
        id: 'doc-1',
        display: { title: 'Document with works' },
      },
    ];
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/all?linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('returns 400 for invalid linkedWork format', async () => {
    const { agent } = mockedApi([]);

    const response = await agent.get(`/all?linkedWork=invalid-work-id!`);
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid work ID format');
  });

  it('accepts both query and linkedWork parameters', async () => {
    const docs = [
      {
        id: 'doc-1',
        display: { title: 'Health article' },
      },
    ];
    const { agent } = mockedApi(docs);

    const response = await agent.get(`/all?query=health&linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });
});
