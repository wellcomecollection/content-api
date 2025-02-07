import * as prismic from '@prismicio/client';

import { PrismicImage } from './images';

export { ArticlePrismicDocument, WithArticleFormat } from './articles';
export { BookPrismicDocument } from './books';
export {
  EventPrismicDocument,
  WithEventFormat,
  PrismicAudiences,
  PrismicInterpretations,
  PrismicLocations,
  PrismicScheduledEvent,
} from './eventDocuments';
export { Contributors, WithContributors } from './contributors';
export { ContentType, PrismicFormat, ArticleFormatId } from './formats';
export { PrismicImage } from './images';
export { WithSeries } from './series';
export { VisualStoryPrismicDocument } from './visualStory';
export { ProjectPrismicDocument } from './projects';
export { SeasonPrismicDocument } from './seasons';
export { ExhibitionTextPrismicDocument } from './exhibitionTexts';
export { ExhibitionHighlightTourPrismicDocument } from './exhibitionHighlightTours';
export { ExhibitionPrismicDocument } from './exhibitions';
export { PagePrismicDocument } from './pages';

/**
 * This is a convenience type for what the generic DataInterface type extend in @prismicio/client
 */
export type DataInterface = Record<
  string,
  prismic.AnyRegularField | prismic.GroupField | prismic.SliceZone
>;

/**
 * This allows us to get the DataInterface from PrismicDocuments when we
 * Need them for `ContentRelationshipField`s e.g.
 *
 *     type Doc = PrismicDocument<{ title: prismic.RichTextField }>
 *     type DataInterface = InferDataInterface<Doc> // { title: RichTextField }
 *     ContentRelationshipField<'formats', 'en-gb', DataInterface>
 *
 */
export type InferDataInterface<T> =
  T extends prismic.PrismicDocument<infer DataInterface>
    ? DataInterface
    : never;

type Promo = { caption: prismic.RichTextField; image: PrismicImage };
export type PromoSliceZone = prismic.SliceZone<
  prismic.Slice<'editorialImage', Promo>
>;

export type CommonPrismicFields = {
  title: prismic.RichTextField;
  promo: PromoSliceZone;
};
