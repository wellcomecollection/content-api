import { linkedDocumentIdentifiers } from "../../src/transformers/utils";

describe("linkedDocumentIdentifiers", () => {
  it("extracts linked document identifier where the document has data", () => {
    const document = {
      apples: "pears",
      things: [1, 2, 3],
      answer: 42,
      deeply: {
        nested: 1,
        bits: {
          and: {
            pieces: {
              link_type: "Document",
              id: "abc",
              data: {
                name: "wellcome",
              },
            },
          },
        },
        another: "property",
      },
      stuff: [
        {
          thing: {
            link_type: "Document",
            id: "def",
            data: {
              name: "henry",
            },
          },
        },
      ],
    };
    const identifiers = linkedDocumentIdentifiers(document);
    expect(identifiers).toIncludeSameMembers(["abc", "def"]);
  });

  it("ignores linked documents without data", async () => {
    const document = {
      thing: {
        link_type: "Document",
        id: "abc",
      },
    };
    const identifiers = linkedDocumentIdentifiers(document);
    await expect(identifiers).toBeEmpty();
  });
});
