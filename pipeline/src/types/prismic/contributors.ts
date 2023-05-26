import * as prismicT from "@prismicio/types";

type PrismicContributorContributor =
  | prismicT.EmptyLinkField<"Document">
  | prismicT.FilledLinkToDocumentField<
    "organisations" | "people",
    "en-gb",
    { name: prismicT.RichTextField }
  >;

type PrismicContributorRole = prismicT.RelationField<
  "editorial-contributor-roles",
  "en-gb",
  { title: prismicT.RichTextField }
>;

type Contributors = prismicT.GroupField<{
  role: PrismicContributorRole;
  contributor: PrismicContributorContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
