import { PrismicImage } from '@weco/content-pipeline/src/types/prismic';

import {
  ElasticsearchAddressableBase,
  ElasticsearchAddressableExtended,
} from './addressables';
import { Article, ArticleFormat } from './article';
import {
  EventDocument,
  EventDocumentFormat,
  EventDocumentInterpretation,
  EventDocumentLocations,
} from './eventDocument';

// Image
export type Image = PrismicImage & {
  type: 'PrismicImage';
};

// Contributors (e.g. author, photographer)
type BasicContributorInformation = {
  id: string;
  label?: string;
};

export type Contributor = {
  type: 'Contributor';
  contributor?: BasicContributorInformation & {
    type: 'Person' | 'Organisation';
  };
  role?: BasicContributorInformation & {
    type: 'EditorialContributorRole';
  };
};

export type Series = {
  id: string;
  title?: string;
  contributors?: string[];
}[];

export type { Article, ArticleFormat };

export type {
  EventDocument,
  EventDocumentFormat,
  EventDocumentLocations,
  EventDocumentInterpretation,
};

export type ElasticsearchArticle = {
  id: string;
  uid?: string;
  display: Article;
  query: {
    linkedIdentifiers: string[];
    title: string;
    publicationDate: Date;
    contributors: string[];
    caption?: string;
    body?: string[] | string;
    standfirst?: string;
    series: Series;
  };
  filter: {
    publicationDate: Date;
    contributors: string[];
    format: string;
  };
  aggregatableValues: {
    contributors: string[];
    format: string;
  };
};

export type ElasticsearchEventDocument = {
  id: string;
  uid: string | null;
  isChildScheduledEvent?: boolean;
  display: EventDocument;
  query: {
    linkedIdentifiers: string[];
    title: string;
    caption?: string;
    series: Series;
    format?: string | string[];
    interpretations?: string[];
    audiences?: string[];
    times: {
      startDateTime?: Date;
      endDateTime?: Date;
    }[];
  };
  filter: {
    format: string;
    interpretations: string[];
    audiences: string[];
    locations: string[];
    isAvailableOnline: boolean;
    times: {
      startDateTime?: Date;
      endDateTime?: Date;
    }[];
  };
  aggregatableValues: {
    format: string;
    interpretations: string[];
    audiences: string[];
    locations: string[];
    isAvailableOnline: string;
  };
};

export type ElasticsearchAddressableArticle =
  ElasticsearchAddressableBase<'Article'>;

export type ElasticsearchAddressableBook = ElasticsearchAddressableExtended<
  'Book',
  { contributors: string }
>;

export type ElasticsearchAddressableEvent = ElasticsearchAddressableExtended<
  'Event',
  { format?: string; times?: { start: Date; end: Date } }
>;

export type ElasticsearchAddressableProject = ElasticsearchAddressableExtended<
  'Project',
  { format?: string }
>;

export type ElasticsearchAddressableSeason =
  ElasticsearchAddressableBase<'Season'>;

export type ElasticsearchAddressableExhibition =
  ElasticsearchAddressableExtended<
    'Exhibition',
    { format: string; dates: { start: string | null; end: string | null } }
  >;

export type ElasticsearchAddressableExhibitionHighlightTour =
  ElasticsearchAddressableExtended<
    'Exhibition highlight tour',
    { highlightTourType: string }
  >;

export type ElasticsearchAddressableExhibitionText =
  ElasticsearchAddressableBase<'Exhibition text'>;

export type ElasticsearchAddressablePage = ElasticsearchAddressableExtended<
  'Page',
  { tags: string[] }
>;

export type ElasticsearchAddressableVisualStory =
  ElasticsearchAddressableBase<'Visual story'>;
