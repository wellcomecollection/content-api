import {
  EmptyLinkField,
  FilledLinkToDocumentField,
  GroupField,
  PrismicDocument,
  RelationField,
  RichTextField,
} from "@prismicio/types";
import { InferDataInterface } from "..";

type PrismicContributorContributor =
  | EmptyLinkField<"Document">
  | FilledLinkToDocumentField<
      "organisations" | "people",
      "en-gb",
      InferDataInterface<PrismicDocument<{ name: RichTextField }>>
    >;

type PrismicContributorRole = RelationField<
  "editorial-contributor-roles",
  "en-gb",
  InferDataInterface<
    PrismicDocument<{
      title: RichTextField;
    }>
  >
>;

type Contributors = GroupField<{
  role: PrismicContributorRole;
  contributor: PrismicContributorContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
