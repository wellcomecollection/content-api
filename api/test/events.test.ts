import { mockedApi } from './fixtures/api';

describe('GET /events', () => {
  it('returns a list of events', async () => {
    const events = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test event ${i}`,
      },
    }));
    const api = mockedApi(events);

    const response = await api.get(`/events`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toStrictEqual(events.map(x => x.display));
  });

  it('accepts linkedWork parameter', async () => {
    const events = [
      {
        id: 'event-1',
        display: { title: 'Event with works' },
      },
    ];
    const api = mockedApi(events);

    const response = await api.get(`/events?linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('returns 400 for invalid linkedWork format', async () => {
    const api = mockedApi([]);

    const response = await api.get(`/events?linkedWork=invalid-work-id!`);
    expect(response.statusCode).toBe(400);
    expect(response.body.description).toContain('Invalid work ID format');
  });

  it('accepts both query and linkedWork parameters', async () => {
    const events = [
      {
        id: 'event-1',
        display: { title: 'Health event' },
      },
    ];
    const api = mockedApi(events);

    const response = await api.get(`/events?query=health&linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('accepts multiple linkedWork parameters', async () => {
    const events = [
      {
        id: 'event-1',
        display: { title: 'Event with multiple works' },
      },
    ];
    const api = mockedApi(events);

    const response = await api.get(`/events?linkedWork=work123,work456`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });
});
