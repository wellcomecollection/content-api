import { mockedApi } from './fixtures/api';

describe('GET /all/:id', () => {
  it('returns a document for the given ID', async () => {
    const testId = 'Z-L8zREAACUAxTSz.exhibitions';
    const testDoc = { title: 'test-addressable' };
    const api = mockedApi([{ id: testId, display: testDoc }]);

    const response = await api.get(`/all/${encodeURIComponent(testId)}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });

  it('returns a 404 if no document for the given ID exists', async () => {
    const api = mockedApi([]);

    const response = await api.get(
      `/all/${encodeURIComponent('Z-L8zREAACUAxTSz.exhibitions')}`
    );
    expect(response.statusCode).toBe(404);
  });

  it('returns a 400 for invalid content types', async () => {
    const invalidTestId = 'ZX123.invalid-content-type';
    const api = mockedApi([]);

    const response = await api.get(`/all/${encodeURIComponent(invalidTestId)}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid content type');
  });

  it('returns a 400 for invalid id format (missing content type)', async () => {
    const api = mockedApi([]);

    const response = await api.get(`/all/Z-L8zREAACUAxTSz`);
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid id format');
  });

  it('returns a 400 for invalid Prismic ID format', async () => {
    const api = mockedApi([]);

    const response = await api.get(
      `/all/${encodeURIComponent('invalid%20id.exhibitions')}`
    );
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid Prismic ID format');
  });

  it('returns a 400 for invalid exhibition highlight tour type', async () => {
    const api = mockedApi([]);

    const response = await api.get(
      `/all/${encodeURIComponent('Z-L8zREAACUAxTSz.exhibition-highlight-tours.invalid')}`
    );
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid tour type');
  });

  it('accepts valid exhibition highlight tour with audio type', async () => {
    const testId = 'Z-L8zREAACUAxTSz.exhibition-highlight-tours.audio';
    const testDoc = { title: 'test-tour' };
    const api = mockedApi([{ id: testId, display: testDoc }]);

    const response = await api.get(`/all/${encodeURIComponent(testId)}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });

  it('accepts valid exhibition highlight tour with BSL type', async () => {
    const testId = 'Z-L8zREAACUAxTSz.exhibition-highlight-tours.bsl';
    const testDoc = { title: 'test-bsl-tour' };
    const api = mockedApi([{ id: testId, display: testDoc }]);

    const response = await api.get(`/all/${encodeURIComponent(testId)}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(testDoc);
  });
});
