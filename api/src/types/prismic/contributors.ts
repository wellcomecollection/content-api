import {
  EmptyLinkField,
  FilledLinkToDocumentField,
  GroupField,
  KeyTextField,
  PrismicDocument,
  RelationField,
  RichTextField,
} from "@prismicio/types";
import { PrismicImage, InferDataInterface } from "..";

type PrismicContributor =
  | EmptyLinkField<"Document">
  | FilledLinkToDocumentField<"people", "en-gb", InferDataInterface<Person>>
  | FilledLinkToDocumentField<
      "organisations",
      "en-gb",
      InferDataInterface<Organisation>
    >;

/**
 * Odd name but we've used it since the start, and never been able to change it
 * as renaming types in Prismic is impossible.
 * See {@link https://community.prismic.io/t/import-export-change-type-of-imported-document/7814}
 */
type EditorialContributorRole = PrismicDocument<
  {
    title: RichTextField;
    describedBy: KeyTextField;
  },
  "editorial-contributor-roles"
>;

type Person = PrismicDocument<
  {
    name: KeyTextField;
    description: RichTextField;
    pronouns: KeyTextField;
    image: PrismicImage;
    sameAs: GroupField<{
      link: KeyTextField;
      title: RichTextField;
    }>;
  },
  "people"
>;

type Organisation = PrismicDocument<
  {
    name: RichTextField;
    description: RichTextField;
    image: PrismicImage;
    sameAs: GroupField<{
      link: KeyTextField;
      title: KeyTextField;
    }>;
  },
  "organisations"
>;

export type WithContributors = {
  contributorsTitle: RichTextField;
  contributors: GroupField<{
    role: RelationField<
      "editorial-contributor-roles",
      "en-gb",
      InferDataInterface<EditorialContributorRole>
    >;
    contributor: PrismicContributor;
    description: RichTextField;
  }>;
};
