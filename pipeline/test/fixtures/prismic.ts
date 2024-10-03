import * as prismic from '@prismicio/client';

export const prismicGet = <T extends prismic.PrismicDocument>(docs: T[]) =>
  jest
    .fn()
    .mockResolvedValueOnce({ results: docs })
    .mockResolvedValue({ results: [] });
