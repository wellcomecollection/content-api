import { mockedApi } from './fixtures/api';

describe('GET /articles/:id', () => {
  it('returns a document for the given ID', async () => {
    const testId = '123';
    const testDoc = { title: 'test-article' };
    const { agent } = mockedApi([{ id: testId, display: testDoc }]);

    const response = await agent.get(`/articles/${testId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });

  it('returns a 404 if no document for the given ID exists', async () => {
    const { agent } = mockedApi([]);

    const response = await agent.get(`/articles/123`);
    expect(response.statusCode).toBe(404);
  });
});
