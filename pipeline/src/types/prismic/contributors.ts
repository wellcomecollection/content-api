import {
  EmptyLinkField,
  FilledLinkToDocumentField,
  GroupField,
  RelationField,
  RichTextField,
} from "@prismicio/types";

type PrismicContributorContributor =
  | EmptyLinkField<"Document">
  | FilledLinkToDocumentField<
      "organisations" | "people",
      "en-gb",
      { name: RichTextField }
    >;

type PrismicContributorRole = RelationField<
  "editorial-contributor-roles",
  "en-gb",
  { title: RichTextField }
>;

type Contributors = GroupField<{
  role: PrismicContributorRole;
  contributor: PrismicContributorContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
