import {
  AnyRegularField,
  GroupField,
  KeyTextField,
  PrismicDocument,
  RichTextField,
  Slice,
  SliceZone,
} from "@prismicio/types";
import { PrismicImage } from "..";

/**
 * This is a convenience type for what the generic DataInterface type extend in @prismicio/types
 */
export type DataInterface = Record<
  string,
  AnyRegularField | GroupField | SliceZone
>;

/**
 * This allows us to get the DataInterface from PrismicDocuments when we
 * Need them for `RelationField`s e.g.
 * type Doc = PrismicDocument<{ title: RichTextField }>
 * type DataInterface = InferDataInterface<Doc> // { title: RichTextField }
 * RelationField<'formats', 'en-gb', DataInterface>
 */
export type InferDataInterface<T> = T extends PrismicDocument<
  infer DataInterface
>
  ? DataInterface
  : never;

type Promo = { caption: RichTextField; image: PrismicImage };
export type PromoSliceZone = SliceZone<Slice<"editorialImage", Promo>>;

// This one was taken from the stories search, not from Content (as that one contains way more)
export type CommonPrismicFields = {
  title: RichTextField;
  promo: PromoSliceZone;
};
