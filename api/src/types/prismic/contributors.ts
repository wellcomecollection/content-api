import {
  EmptyLinkField,
  FilledLinkToDocumentField,
  GroupField,
  RelationField,
  RichTextField,
} from "@prismicio/types";
import { InferDataInterface } from "..";

type PrismicContributorContributor =
  | EmptyLinkField<"Document">
  | FilledLinkToDocumentField<
      "organisations" | "people",
      "en-gb",
      InferDataInterface<{ name: RichTextField }>
    >;

type Contributors = GroupField<{
  role: RelationField<
    "editorial-contributor-roles",
    "en-gb",
    InferDataInterface<{
      title: RichTextField;
    }>
  >;
  contributor: PrismicContributorContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
