import { EVENT_EXHIBITION_FORMAT_ID } from '@weco/content-common/data/defaultValues';

import { mockedApi } from './fixtures/api';

describe('GET /events', () => {
  it('returns a list of events', async () => {
    const events = Array.from({ length: 10 }).map((_, i) => ({
      id: `id-${i}`,
      display: {
        title: `test event ${i}`,
      },
    }));
    const { agent } = mockedApi(events);

    const response = await agent.get(`/events`);
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
    const { agent } = mockedApi(events);

    const response = await agent.get(`/events?linkedWork=work123`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  it('returns 400 for invalid linkedWork format', async () => {
    const { agent } = mockedApi([]);

    const response = await agent.get(`/events?linkedWork=invalid-work-id!`);
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
    const { agent } = mockedApi(events);

    const response = await agent.get(`/events?query=health&linkedWork=work123`);
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
    const { agent } = mockedApi(events);

    const response = await agent.get(`/events?linkedWork=work123,work456`);
    expect(response.statusCode).toBe(200);
    expect(response.body.results).toBeDefined();
  });

  describe('format alias mapping', () => {
    it('maps exhibitions slug to correct Prismic ID in ES query', async () => {
      const events = [{ id: 'event-1', display: { title: 'Test' } }];
      const { agent, mocks } = mockedApi(events);

      await agent.get('/events?format=!exhibitions');

      expect(mocks.elasticClientSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                expect.objectContaining({
                  bool: expect.objectContaining({
                    must_not: expect.arrayContaining([
                      {
                        terms: {
                          'filter.format': [EVENT_EXHIBITION_FORMAT_ID],
                        },
                      },
                    ]),
                  }),
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('passes raw Prismic ID through unchanged in ES query', async () => {
      const events = [{ id: 'event-1', display: { title: 'Test' } }];
      const { agent, mocks } = mockedApi(events);

      const rawId = 'WcKmiysAACx_A8NR';
      await agent.get(`/events?format=!${rawId}`);

      expect(mocks.elasticClientSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                expect.objectContaining({
                  bool: expect.objectContaining({
                    must_not: expect.arrayContaining([
                      { terms: { 'filter.format': [rawId] } },
                    ]),
                  }),
                }),
              ]),
            }),
          }),
        })
      );
    });
  });
});
