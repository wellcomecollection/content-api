import type * as prismic from '@prismicio/client';

import {
  EditorialImageGallerySlice,
  GifVideoSlice,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

export type AddressableSlices =
  | prismic.Content.ArticlesDocumentDataBodySlice
  | prismic.Content.BooksDocumentDataBodySlice
  | prismic.Content.EventsDocumentDataBodySlice
  | prismic.Content.ExhibitionsDocumentDataBodySlice
  | prismic.Content.ExhibitionHighlightToursDocumentDataSlicesSlice
  | prismic.Content.ExhibitionTextsDocumentDataSlicesSlice
  | prismic.Content.PagesDocumentDataBodySlice
  | prismic.Content.ProjectsDocumentDataBodySlice
  | prismic.Content.SeasonsDocumentDataBodySlice
  | prismic.Content.VisualStoriesDocumentDataBodySlice;

// Helper functions for extracting Wellcome Collection work IDs from Prismic slice content.
// Searches for works URLs (https://wellcomecollection.org/works/[id]) in:
// - Text slices: hyperlinks in 'text' rich text field
// - Editorial image slices: hyperlinks in 'caption' rich text field, URLs in the image's copyright string
// - Editorial image gallery slices: hyperlinks in each item's 'caption' rich text field, URLs in each item's image copyright string
// - gifVideo slices: hyperlinks in 'caption' rich text field, URLs in the tasl string
const worksUrlPattern = /^https:\/\/wellcomecollection\.org\/works\/([^/?#]+)/i;

const extractWorksIdsFromRichTextField = ({
  richTextField,
}: {
  richTextField: prismic.RichTextField;
}): string[] => {
  return richTextField.reduce<string[]>((worksIds, textElement) => {
    if ('text' in textElement) {
      const extractedIds = textElement.spans.reduce<string[]>(
        (spanIds, span) => {
          if (
            span.type === 'hyperlink' &&
            span.data.link_type === 'Web' &&
            span.data.url
          ) {
            const match = span.data.url.match(worksUrlPattern);
            if (match?.[1]) {
              spanIds.push(match[1]);
            }
          }
          return spanIds;
        },
        []
      );
      worksIds.push(...extractedIds);
    }
    return worksIds;
  }, []);
};

// We expect a string that may contain work URLs anywhere within it
const extractWorksIdsFromString = ({
  text,
}: {
  text: string | null | undefined;
}): string[] => {
  const worksIds: string[] = [];

  if (text && typeof text === 'string') {
    const globalWorksUrlPattern =
      /https:\/\/wellcomecollection\.org\/works\/([^/?#\s|]+)/gi;
    const matches = text.matchAll(globalWorksUrlPattern);

    for (const match of matches) {
      if (match[1]) {
        worksIds.push(match[1]);
      }
    }
  }

  return worksIds;
};

const extractWorksIdsFromGifVideoTasl = ({
  slice,
}: {
  slice: GifVideoSlice;
}): string[] => {
  return extractWorksIdsFromString({
    text: slice.primary.tasl,
  });
};

const extractWorksIdsFromEditorialImageGallery = ({
  slice,
}: {
  slice: EditorialImageGallerySlice;
}): string[] => {
  const worksIds: string[] = [];

  slice.items.forEach(item => {
    const copyrightIds = extractWorksIdsFromString({
      text: item.image.copyright,
    });
    worksIds.push(...copyrightIds);

    const captionIds = extractWorksIdsFromRichTextField({
      richTextField: item.caption,
    });
    worksIds.push(...captionIds);
  });

  return worksIds;
};

const extractWorksIdsFromSlices = (slices: AddressableSlices[]): string[] => {
  const worksIds = slices.flatMap(slice => {
    switch (slice.slice_type) {
      case 'text':
        return extractWorksIdsFromRichTextField({
          richTextField: slice.primary.text,
        });
      case 'editorialImage':
        // We check copyright before caption to maintain the original order of the ids in the Prismic document.
        // This is important for the correct display of works in the frontend.
        return [
          ...extractWorksIdsFromString({
            text: slice.primary.image.copyright,
          }),
          ...extractWorksIdsFromRichTextField({
            richTextField: slice.primary.caption,
          }),
        ];
      case 'editorialImageGallery':
        return extractWorksIdsFromEditorialImageGallery({
          slice,
        });
      case 'gifVideo':
        // We check tasl before caption to maintain the original order of the ids in the Prismic document.
        // This is important for the correct display of works in the frontend.
        return [
          ...extractWorksIdsFromGifVideoTasl({ slice }),
          ...extractWorksIdsFromRichTextField({
            richTextField: slice.primary.caption,
          }),
        ];
      default:
        return [];
    }
  });

  // Return deduplicated array
  return [...new Set(worksIds)];
};

export const getWorksIdsFromDocumentBody = (
  documentBody: AddressableSlices[]
): string[] => {
  const supportedSliceTypes = [
    'text',
    'editorialImage',
    'editorialImageGallery',
    'gifVideo',
  ];

  const relevantSlices = documentBody.filter(slice =>
    supportedSliceTypes.includes(slice.slice_type)
  );

  return extractWorksIdsFromSlices(relevantSlices);
};
