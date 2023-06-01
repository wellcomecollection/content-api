import * as prismic from "@prismicio/client";
import { lastValueFrom, of } from "rxjs";
import { getDocumentsByID, paginator } from "../src/helpers/prismic";
import { identifiedDocuments } from "./fixtures/generators";

describe("paginator", () => {
  it("continues returning next pages until no documents are returned", async () => {
    const totalDocs = 100;
    const pageSize = 10;
    const allThings = identifiedDocuments(
      totalDocs
    ) as unknown as prismic.PrismicDocument[];
    const nextPage = jest.fn((after?: string) => {
      const idx = after ? allThings.findIndex((doc) => doc.id === after) : 0;
      return Promise.resolve({
        docs: allThings.slice(idx),
        lastDocId: allThings[idx + pageSize]?.id,
      });
    });

    const lastDoc = await lastValueFrom(paginator(nextPage));
    expect(lastDoc.id).toBe(allThings[allThings.length - 1].id);
    expect(nextPage).toHaveBeenCalledTimes(totalDocs / pageSize);
  });
});

describe("getDocumentsByID", () => {
  it("queries for batches of document IDs", async () => {
    const allDocuments = identifiedDocuments(100);
    const prismicGetByIDs = jest
      .fn()
      .mockResolvedValue({ results: allDocuments });
    const prismicClient = {
      getByIDs: prismicGetByIDs,
    } as unknown as prismic.Client;

    const lastDoc = await lastValueFrom(
      of(...allDocuments.map(({ id }) => id)).pipe(
        getDocumentsByID(prismicClient)
      )
    );
    expect(lastDoc.id).toBe(allDocuments[allDocuments.length - 1].id);
    expect(prismicGetByIDs).toHaveBeenCalledTimes(1);
  });
});
