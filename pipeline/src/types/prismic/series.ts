import * as prismic from '@prismicio/client';

import { WithContributors } from './contributors';

export type WithSeries = {
  series: Series;
};

type Series = prismic.GroupField<{
  series: PrismicSeries;
}>;

type PrismicSeries = prismic.ContentRelationshipField<
  'webcomic-series' | 'series',
  'en-gb',
  { title: prismic.RichTextField } & WithContributors
>;
