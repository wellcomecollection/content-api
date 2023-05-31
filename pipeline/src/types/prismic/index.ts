import * as prismic from "@prismicio/client";
import { PrismicImage } from "..";

/**
 * This is a convenience type for what the generic DataInterface type extend in @prismicio/types
 */
export type DataInterface = Record<
  string,
  prismic.AnyRegularField | prismic.GroupField | prismic.SliceZone
>;

/**
 * This allows us to get the DataInterface from PrismicDocuments when we
 * Need them for `RelationField`s e.g.
 * type Doc = PrismicDocument<{ title: RichTextField }>
 * type DataInterface = InferDataInterface<Doc> // { title: RichTextField }
 * RelationField<'formats', 'en-gb', DataInterface>
 */
export type InferDataInterface<T> = T extends prismic.PrismicDocument<
  infer DataInterface
>
  ? DataInterface
  : never;

type Promo = { caption: prismic.RichTextField; image: PrismicImage };
export type PromoSliceZone = prismic.SliceZone<
  prismic.Slice<"editorialImage", Promo>
>;

export type CommonPrismicFields = {
  title: prismic.RichTextField;
  promo: PromoSliceZone;
};
