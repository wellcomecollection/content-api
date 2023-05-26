import * as prismic from "@prismicio/client";

type PrismicContributorContributor =
  | prismic.EmptyLinkField<"Document">
  | prismic.FilledLinkToDocumentField<
    "organisations" | "people",
    "en-gb",
    { name: prismic.RichTextField }
  >;

type PrismicContributorRole = prismic.RelationField<
  "editorial-contributor-roles",
  "en-gb",
  { title: prismic.RichTextField }
>;

type Contributors = prismic.GroupField<{
  role: PrismicContributorRole;
  contributor: PrismicContributorContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
