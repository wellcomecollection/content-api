import {
  AddressableArticleDisplay,
  AddressableBookDisplay,
  AddressableEventDisplay,
  AddressableExhibitionDisplay,
  AddressableExhibitionHighlightTourDisplay,
  AddressableExhibitionTextDisplay,
  AddressablePageDisplay,
  AddressableProjectDisplay,
  AddressableSeasonDisplay,
  AddressableVisualStoryDisplay,
} from '@weco/content-common/types/addressable';
import { Article } from '@weco/content-common/types/article';
import {
  EventDocument,
  Series,
} from '@weco/content-common/types/eventDocument';

import { ElasticsearchAddressable } from './addressables';

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

export type ElasticsearchAddressableArticle = ElasticsearchAddressable<
  'Article',
  AddressableArticleDisplay
>;

export type ElasticsearchAddressableBook = ElasticsearchAddressable<
  'Book',
  AddressableBookDisplay
>;

export type ElasticsearchAddressableEvent = ElasticsearchAddressable<
  'Event',
  AddressableEventDisplay
>;

export type ElasticsearchAddressableProject = ElasticsearchAddressable<
  'Project',
  AddressableProjectDisplay
>;

export type ElasticsearchAddressableSeason = ElasticsearchAddressable<
  'Season',
  AddressableSeasonDisplay
>;

export type ElasticsearchAddressableExhibition = ElasticsearchAddressable<
  'Exhibition',
  AddressableExhibitionDisplay
>;

export type ElasticsearchAddressableExhibitionHighlightTour =
  ElasticsearchAddressable<
    'Exhibition highlight tour',
    AddressableExhibitionHighlightTourDisplay
  >;

export type ElasticsearchAddressableExhibitionText = ElasticsearchAddressable<
  'Exhibition text',
  AddressableExhibitionTextDisplay
>;

export type ElasticsearchAddressablePage = ElasticsearchAddressable<
  'Page',
  AddressablePageDisplay
>;

export type ElasticsearchAddressableVisualStory = ElasticsearchAddressable<
  'Visual story',
  AddressableVisualStoryDisplay
>;
