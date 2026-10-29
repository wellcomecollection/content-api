import * as prismic from '@prismicio/client';

import type {
  ArticlesDocument,
  BooksDocument,
  ContentRelationshipFieldWithData,
  EventsDocument,
  ExhibitionHighlightToursDocument,
  ExhibitionsDocument,
  ExhibitionTextsDocument,
  ProjectsDocument,
  WebcomicsDocument,
} from './prismicio-types';

export { ContentType, ArticleFormatId } from './formats';

/**
 * Replaces the content relationship fields of a generated document with
 * the versions that include the data we fetch for them in our graph queries.
 */
type WithFetchedLinks<
  TDocument extends { data: object },
  TFetched extends Partial<Record<keyof TDocument['data'], unknown>>,
> = Omit<TDocument, 'data'> & {
  data: Omit<TDocument['data'], keyof TFetched> & TFetched;
};

type Lang = 'en-gb';

const contributorsGroup = {
  id: 'contributors',
  fields: [
    {
      id: 'contributor',
      customtypes: [
        { id: 'people', fields: ['name'] },
        { id: 'organisations', fields: ['name'] },
      ],
    },
  ],
} as const;

/**
 * The fields our graph queries fetch for each type of linked document.
 * The types below are derived from this, and a test checks it against the
 * linked documents in our Prismic snapshots, so it can't drift from the queries.
 */
export const fetchedFields = {
  'article-formats': ['title'],
  'event-formats': ['title'],
  'exhibition-formats': ['title'],
  'project-formats': ['title'],
  'editorial-contributor-roles': ['title'],
  people: ['name'],
  organisations: ['name'],
  places: ['title'],
  'interpretation-types': ['title'],
  audiences: ['title'],
  exhibitions: ['title', 'promo'],
  events: [
    'title',
    'isOnline',
    'times',
    {
      id: 'format',
      customtypes: [{ id: 'event-formats', fields: ['title'] }],
    },
    {
      id: 'locations',
      fields: [
        { id: 'location', customtypes: [{ id: 'places', fields: ['title'] }] },
      ],
    },
    {
      id: 'interpretations',
      fields: [
        {
          id: 'interpretationType',
          customtypes: [{ id: 'interpretation-types', fields: ['title'] }],
        },
      ],
    },
    {
      id: 'audiences',
      fields: [
        {
          id: 'audience',
          customtypes: [{ id: 'audiences', fields: ['title'] }],
        },
      ],
    },
  ],
  series: ['title', contributorsGroup],
  'webcomic-series': ['title', contributorsGroup],
  'event-series': ['title', contributorsGroup],
} as const;

type FetchedFields = typeof fetchedFields;

/** A content relationship field to documents of the given types, with the data we fetch for them. */
type FetchedLink<TId extends keyof FetchedFields> =
  ContentRelationshipFieldWithData<
    { [K in TId]: { id: K; fields: FetchedFields[K] } }[TId][],
    Lang
  >;

type ContributorLink = FetchedLink<'people' | 'organisations'>;

export type WithContributors = {
  contributors: prismic.GroupField<{
    role: FetchedLink<'editorial-contributor-roles'>;
    contributor: ContributorLink;
  }>;
};

type SeriesType = 'series' | 'webcomic-series' | 'event-series';

export type WithSeries<TId extends SeriesType = SeriesType> = {
  series: prismic.GroupField<{
    series: FetchedLink<TId>;
  }>;
};

export type WithArticleFormat = { format: FetchedLink<'article-formats'> };
export type WithEventFormat = { format: FetchedLink<'event-formats'> };
export type WithExhibitionFormat = {
  format: FetchedLink<'exhibition-formats'>;
};
export type WithProjectFormat = { format: FetchedLink<'project-formats'> };

type PromoOnly = FetchedLink<'exhibitions'>;

export type ArticlesDocumentWithLinks = WithFetchedLinks<
  ArticlesDocument,
  WithArticleFormat & WithContributors & WithSeries<'series'>
>;
export type WebcomicsDocumentWithLinks = WithFetchedLinks<
  WebcomicsDocument,
  WithArticleFormat & WithContributors & WithSeries<'webcomic-series'>
>;
export type ArticlesOrWebcomicsDocumentWithLinks =
  ArticlesDocumentWithLinks | WebcomicsDocumentWithLinks;
export type BooksDocumentWithLinks = WithFetchedLinks<
  BooksDocument,
  WithContributors
>;
export type ExhibitionsDocumentWithLinks = WithFetchedLinks<
  ExhibitionsDocument,
  WithExhibitionFormat & WithContributors
>;
export type ExhibitionHighlightToursDocumentWithLinks = WithFetchedLinks<
  ExhibitionHighlightToursDocument,
  { related_exhibition: PromoOnly }
>;
export type ExhibitionTextsDocumentWithLinks = WithFetchedLinks<
  ExhibitionTextsDocument,
  { related_exhibition: PromoOnly }
>;
export type ProjectsDocumentWithLinks = WithFetchedLinks<
  ProjectsDocument,
  WithProjectFormat & WithContributors
>;

export type PrismicLocations = prismic.GroupField<{
  location: FetchedLink<'places'>;
}>;
export type PrismicInterpretations = prismic.GroupField<{
  interpretationType: FetchedLink<'interpretation-types'>;
}>;
export type PrismicAudiences = prismic.GroupField<{
  audience: FetchedLink<'audiences'>;
}>;
export type PrismicTimes = EventsDocument['data']['times'];
export type PrismicScheduledEvent = prismic.GroupField<{
  event: FetchedLink<'events'>;
}>;

export type EventsDocumentWithLinks = WithFetchedLinks<
  EventsDocument,
  WithEventFormat &
    WithContributors &
    WithSeries<'event-series'> & {
      locations: PrismicLocations;
      interpretations: PrismicInterpretations;
      audiences: PrismicAudiences;
      schedule: PrismicScheduledEvent;
    }
>;

export type PrismicImage = prismic.ImageField<
  '32:15' | '16:9' | 'square',
  'filled'
>;
