import * as prismicT from "@prismicio/types";
import { PrismicImage } from "..";

/**
 * This is a convenience type for what the generic DataInterface type extend in @prismicio/types
 */
export type DataInterface = Record<
  string,
  prismicT.AnyRegularField | prismicT.GroupField | prismicT.SliceZone
>;

/**
 * This allows us to get the DataInterface from PrismicDocuments when we
 * Need them for `RelationField`s e.g.
 * type Doc = PrismicDocument<{ title: RichTextField }>
 * type DataInterface = InferDataInterface<Doc> // { title: RichTextField }
 * RelationField<'formats', 'en-gb', DataInterface>
 */
export type InferDataInterface<T> = T extends prismicT.PrismicDocument<
  infer DataInterface
>
  ? DataInterface
  : never;

type Promo = { caption: prismicT.RichTextField; image: PrismicImage };
export type PromoSliceZone = prismicT.SliceZone<prismicT.Slice<"editorialImage", Promo>>;

export type CommonPrismicFields = {
  title: prismicT.RichTextField;
  promo: PromoSliceZone;
};
