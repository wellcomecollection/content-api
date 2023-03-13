import {
  EmptyLinkField,
  FilledLinkToDocumentField,
  GroupField,
  RelationField,
  RichTextField,
} from "@prismicio/types";
import { InferDataInterface } from "..";

type PrismicContributor =
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
  contributor: PrismicContributor;
}>;

export type WithContributors = {
  contributors: Contributors;
};
