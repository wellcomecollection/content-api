import {
  GroupField,
  NumberField,
  PrismicDocument,
  RelationField,
  RichTextField,
  TimestampField,
} from "@prismicio/types";
import {
  WithContributors,
  InferDataInterface,
  CommonPrismicFields,
  WithSeries,
  WithSeasons,
} from "..";

export type ArticleFormat = PrismicDocument<
  {
    type: "ArticleFormat";
    id: string;
    title: RichTextField;
  },
  "article-formats"
>;

type WithArticleFormat = {
  format: RelationField<
    "article-formats",
    "en-gb",
    InferDataInterface<ArticleFormat>
  >;
};

type WithExhibitionParents = {
  parents: GroupField<{
    order: NumberField;
    parent: RelationField<
      "exhibitions",
      // We know this is an ExhibitionPrismicDocument, but the type checker gets
      // unhappy about the circular reference:
      //
      //    'event' is referenced directly or indirectly in its own type annotation.
      //
      // TODO: Find a better way to do this which doesn't upset the type checker.
      InferDataInterface<any>
    >;
  }>;
};

// TODO is this all needed?
export type ArticlePrismicDocument = PrismicDocument<
  {
    publishDate: TimestampField;
  } & WithSeries &
    WithContributors &
    WithSeasons &
    WithArticleFormat &
    WithExhibitionParents &
    CommonPrismicFields,
  "articles"
>;
