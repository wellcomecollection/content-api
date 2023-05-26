import * as prismicT from "@prismicio/types";

export const prismicGet = <T extends prismicT.PrismicDocument>(docs: T[]) =>
  jest
    .fn()
    .mockResolvedValueOnce({ results: docs })
    .mockResolvedValue({ results: [] });
