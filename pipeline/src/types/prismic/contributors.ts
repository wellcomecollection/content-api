import * as prismic from "@prismicio/client";

export type WithContributors = {
  contributors: Contributors;
};

type PrismicContributorContributor =
  | prismic.EmptyLinkField<"Document">
  | prismic.FilledContentRelationshipField<
      "organisations" | "people",
      "en-gb",
      { name: prismic.RichTextField }
    >;

type PrismicContributorRole = prismic.ContentRelationshipField<
  "editorial-contributor-roles",
  "en-gb",
  { title: prismic.RichTextField }
>;

export type Contributors = prismic.GroupField<{
  role: PrismicContributorRole;
  contributor: PrismicContributorContributor;
}>;
