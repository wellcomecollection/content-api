import { transformAddressable } from '@weco/content-pipeline/src/transformers/addressables';
import {
  ArticlesOrWebcomicsDocumentWithLinks,
  BooksDocumentWithLinks,
  EventsDocumentWithLinks,
  ExhibitionHighlightToursDocumentWithLinks,
  ExhibitionTextsDocumentWithLinks,
  ProjectsDocumentWithLinks,
} from '@weco/content-pipeline/src/types/prismic';
import {
  PagesDocument,
  SeasonsDocument,
  VisualStoriesDocument,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';
import { forEachPrismicSnapshot } from '@weco/content-pipeline/test/fixtures/prismic-snapshots';

// Mock fetch to avoid real HTTP calls to the Catalogue API
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('addressables transformer', () => {
  const isAddressable = true;

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'p4bh9qca',
        title:
          'Practical rules for the management and medical treatment of Negro slaves, in the sugar colonies / by a professional planter.',
        type: 'Work',
        thumbnail: {
          url: 'https://iiif.wellcomecollection.org/thumbs/b21297563_0007.jp2/full/!200,200/0/default.jpg',
        },
        production: [
          {
            dates: [{ label: '1803' }],
          },
        ],
        contributors: [
          {
            primary: true,
            agent: { label: 'Collins, Dr.' },
          },
        ],
        workType: {
          label: 'Books',
        },
        availabilities: [{ id: 'online' }],
      }),
    } as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  forEachPrismicSnapshot<ArticlesOrWebcomicsDocumentWithLinks>(
    ['articles'],
    isAddressable
  )(
    'transforms articles from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ArticlesOrWebcomicsDocumentWithLinks>(
    ['articles'],
    isAddressable
  )('lists linkedWorks from various slices', async prismicDocument => {
    const transformed = await transformAddressable(prismicDocument);
    // Unsure why we have to add eslint-disables,
    // it _is_ in a test() function, see `forEachPrismicSnapshot`

    // eslint-disable-next-line jest/no-standalone-expect
    expect(Array.isArray(transformed)).toBe(true);
    const first = transformed[0] as { display?: { linkedWorks?: unknown[] } };
    // eslint-disable-next-line jest/no-standalone-expect
    expect(first.display).toMatchObject({
      linkedWorks: expect.any(Array),
    });
    // eslint-disable-next-line jest/no-standalone-expect
    expect(first.display?.linkedWorks?.length).toBeGreaterThan(0);
  });

  forEachPrismicSnapshot<BooksDocumentWithLinks>(['books'], isAddressable)(
    'transforms books from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<EventsDocumentWithLinks>(['events'], isAddressable)(
    'transforms events from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionTextsDocumentWithLinks>(
    ['exhibitions'],
    isAddressable
  )(
    'transforms exhibitions from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionTextsDocumentWithLinks>(
    ['exhibition-texts'],
    isAddressable
  )(
    'transforms exhibition texts from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ExhibitionHighlightToursDocumentWithLinks>(
    ['exhibition-highlight-tours'],
    isAddressable
  )(
    'transforms exhibition highlight tours from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<PagesDocument>(['pages'], isAddressable)(
    'transforms pages from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<VisualStoriesDocument>(
    ['visual-stories'],
    isAddressable
  )(
    'transforms visual stories from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<ProjectsDocumentWithLinks>(
    ['projects'],
    isAddressable
  )(
    'transforms projects from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );

  forEachPrismicSnapshot<SeasonsDocument>(['seasons'], isAddressable)(
    'transforms seasons from Prismic to the expected format',
    async prismicDocument => {
      const transformed = await transformAddressable(prismicDocument);
      // Unsure why it errors, it _is_ in a test() function, see `forEachPrismicSnapshot`
      // eslint-disable-next-line jest/no-standalone-expect
      expect(transformed).toMatchSnapshot();
    }
  );
});
