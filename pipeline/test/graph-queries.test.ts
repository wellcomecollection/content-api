import {
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionHighlightToursQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesPagesQuery,
  addressablesProjectsQuery,
  addressablesSeasonsQuery,
  addressablesVisualStoriesQuery,
} from '@weco/content-pipeline/src/graph-queries/addressables';
import {
  ArticlesDocument,
  BooksDocument,
  EventsDocument,
  ExhibitionHighlightToursDocument,
  ExhibitionsDocument,
  ExhibitionTextsDocument,
  PagesDocument,
  ProjectsDocument,
  SeasonsDocument,
  VisualStoriesDocument,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

// Extract slice types from a document's body union type
type ExtractSliceTypes<T> = T extends readonly (infer S)[]
  ? S extends { slice_type: infer Type }
    ? Type
    : never
  : never;

// Define the valid slice types for each document type
type ArticleSliceTypes = ExtractSliceTypes<ArticlesDocument['data']['body']>;
type BookSliceTypes = ExtractSliceTypes<BooksDocument['data']['body']>;
type EventSliceTypes = ExtractSliceTypes<EventsDocument['data']['body']>;
type ExhibitionSliceTypes = ExtractSliceTypes<
  ExhibitionsDocument['data']['body']
>;
type ExhibitionHighlightTourSliceTypes = ExtractSliceTypes<
  ExhibitionHighlightToursDocument['data']['slices']
>;
type ExhibitionTextSliceTypes = ExtractSliceTypes<
  ExhibitionTextsDocument['data']['slices']
>;
type PageSliceTypes = ExtractSliceTypes<PagesDocument['data']['body']>;
type ProjectSliceTypes = ExtractSliceTypes<ProjectsDocument['data']['body']>;
type SeasonSliceTypes = ExtractSliceTypes<SeasonsDocument['data']['body']>;
type VisualStorySliceTypes = ExtractSliceTypes<
  VisualStoriesDocument['data']['body']
>;

// Helper to extract slice names from a GraphQL query string
const extractSliceNamesFromQuery = (query: string): string[] => {
  // Match patterns like "...on sliceName {" in GraphQL queries
  const slicePattern = /\.\.\.\s*on\s+([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/g;
  const matches = Array.from(query.matchAll(slicePattern));
  return matches
    .map(match => match[1])
    .filter(name => {
      // Filter out non-slice keywords: variations, document types in promo fields
      return ![
        'default', // variation name
        'people',
        'organisations',
        'event-formats',
        'exhibition-formats',
      ].includes(name);
    });
};

describe('Graph query validation', () => {
  describe('Addressables queries reference only valid slice types', () => {
    it('articles query uses only valid article slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesArticlesQuery
      );
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      // TypeScript will fail compilation if any slice in this array is not a valid ArticleSliceTypes
      const validSlices = [
        'audioPlayer',
        'editorialImage',
        'editorialImageGallery',
        'embed',
        'gifVideo',
        'iframe',
        'infoBlock',
        'quote',
        'standfirst',
        'tagList',
        'text',
      ] satisfies ArticleSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('books query uses only valid book slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(addressablesBooksQuery);
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'text',
        'quote',
        'contentList',
        'infoBlock',
      ] satisfies BookSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('events query uses only valid event slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(addressablesEventsQuery);
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'text',
        'embed',
        'contact',
        'contentList',
        'infoBlock',
        'quote',
      ] satisfies EventSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('exhibitions query uses only valid exhibition slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesExhibitionsQuery
      );
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'text',
        'editorialImageGallery',
        'contentList',
        'embed',
        'infoBlock',
        'quote',
      ] satisfies ExhibitionSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('exhibition-highlight-tours query uses only valid slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesExhibitionHighlightToursQuery
      );
      const sliceSlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'guide_stop',
      ] satisfies ExhibitionHighlightTourSliceTypes[];

      sliceSlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('exhibition-texts query uses only valid slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesExhibitionTextsQuery
      );
      const sliceSlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'guide_section_heading',
        'guide_text_item',
      ] satisfies ExhibitionTextSliceTypes[];

      sliceSlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('pages query uses only valid page slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(addressablesPagesQuery);
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'text',
        'editorialImage',
        'archiveCardList',
        'audioPlayer',
        'cardListing',
        'collectionVenue',
        'contact',
        'contentList',
        'editorialImageGallery',
        'embed',
        'fullWidthBanner',
        'infoBlock',
        'map',
        'quote',
        'searchResults',
        'standfirst',
        'textAndIcons',
        'textAndImage',
        'themeCardsList',
        'titledTextList',
      ] satisfies PageSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('projects query uses only valid project slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesProjectsQuery
      );
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'text',
        'editorialImage',
        'embed',
        'infoBlock',
      ] satisfies ProjectSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('seasons query uses only valid season slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesSeasonsQuery
      );
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = ['standfirst', 'text'] satisfies SeasonSliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });

    it('visual-stories query uses only valid visual story slices', () => {
      const slicesInQuery = extractSliceNamesFromQuery(
        addressablesVisualStoriesQuery
      );
      const bodySlices = slicesInQuery.filter(
        s => !['editorialImage'].some(promo => s === promo)
      );

      const validSlices = [
        'textAndImage',
        'textAndIcons',
        'contact',
        'embed',
        'infoBlock',
        'standfirst',
        'text',
      ] satisfies VisualStorySliceTypes[];

      bodySlices.forEach(slice => {
        expect(validSlices).toContain(slice);
      });
    });
  });

  describe('Graph queries are syntactically valid', () => {
    it('all addressables queries contain valid GraphQL syntax', () => {
      const queries = [
        { name: 'articles', query: addressablesArticlesQuery },
        { name: 'books', query: addressablesBooksQuery },
        { name: 'events', query: addressablesEventsQuery },
        { name: 'exhibitions', query: addressablesExhibitionsQuery },
        {
          name: 'exhibition-highlight-tours',
          query: addressablesExhibitionHighlightToursQuery,
        },
        {
          name: 'exhibition-texts',
          query: addressablesExhibitionTextsQuery,
        },
        { name: 'pages', query: addressablesPagesQuery },
        { name: 'projects', query: addressablesProjectsQuery },
        { name: 'seasons', query: addressablesSeasonsQuery },
        { name: 'visual-stories', query: addressablesVisualStoriesQuery },
      ];

      queries.forEach(({ query }) => {
        // Basic GraphQL syntax checks
        expect(query).toMatch(/\{/); // Has opening brace
        expect(query).toMatch(/\}/); // Has closing brace

        // Count braces to ensure they're balanced
        const openBraces = (query.match(/\{/g) || []).length;
        const closeBraces = (query.match(/\}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
      });
    });
  });
});
