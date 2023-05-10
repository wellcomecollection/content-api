import { PrismicDocument } from "@prismicio/types";

export const prismicGet = <T extends PrismicDocument>(docs: T[]) =>
  jest
    .fn()
    .mockResolvedValueOnce({ results: docs })
    .mockResolvedValue({ results: [] });
