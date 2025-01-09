import { PrismicImage } from '@weco/content-pipeline/src/types/prismic';

import { ElasticsearchAddressable } from './addressables';
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
    contributorIds: string[];
    formatId: string;
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
    times: { startDateTime: Date[] };
  };
  filter: {
    formatId: string;
    interpretationIds: string[];
    audienceIds: string[];
    locationIds: string[];
    isAvailableOnline: boolean;
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
  ElasticsearchAddressable<'Article'>;

export type ElasticsearchAddressableBook = ElasticsearchAddressable<
  'Book',
  { contributors: string }
>;

export type ElasticsearchAddressableEvent = ElasticsearchAddressable<
  'Event',
  { format?: string; times?: { start: Date; end: Date } }
>;

export type ElasticsearchAddressableProject =
  ElasticsearchAddressable<'Project'>;

export type ElasticsearchAddressableSeason = ElasticsearchAddressable<'Season'>;

export type ElasticsearchAddressableExhibition =
  ElasticsearchAddressable<'Exhibition'>;

export type ElasticsearchAddressableExhibitionHighlightTour =
  ElasticsearchAddressable<
    'Exhibition highlight tour',
    { highlightTourType: string }
  >;

export type ElasticsearchAddressableExhibitionText =
  ElasticsearchAddressable<'Exhibition text'>;

export type ElasticsearchAddressablePage = ElasticsearchAddressable<'Page'>;

export type ElasticsearchAddressableVisualStory =
  ElasticsearchAddressable<'Visual story'>;
