import * as prismic from "@prismicio/client";
import { PrismicDocument } from "@prismicio/types";
import { lastValueFrom, of } from "rxjs";
import { getDocumentsByID, paginator } from "../src/helpers/prismic";
import { identifiedDocuments } from "./fixtures/generators";

describe("paginator", () => {
  it("continues returning next pages until no documents are returned", async () => {
    const totalDocs = 100;
    const pageSize = 10;
    const allThings = identifiedDocuments(
      totalDocs
    ) as unknown as PrismicDocument[];
    const nextPage = jest.fn((after?: string) => {
      const idx = parseInt(after ?? "0");
      return Promise.resolve({
        docs: allThings.slice(idx),
        lastDocId: allThings[idx + pageSize]?.id,
      });
    });

    const lastDoc = await lastValueFrom(paginator(nextPage));
    expect(lastDoc.id).toBe(totalDocs.toString());
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
    expect(lastDoc.id).toBe("100");
    expect(prismicGetByIDs).toHaveBeenCalledTimes(1);
  });
});
