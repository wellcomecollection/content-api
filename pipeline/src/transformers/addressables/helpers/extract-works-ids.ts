import type * as prismic from '@prismicio/client';

import {
  EditorialImageGallerySlice,
  EditorialImageSlice,
  GifVideoSlice,
  TextSlice,
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

// We expect a string of title|author|sourceName|sourceLink|license|copyrightHolder|copyrightLink in pipe-delimited fields
const extractWorksIdsFromPipeDelimitedString = ({
  pipeDelimitedString,
}: {
  pipeDelimitedString: string | null | undefined;
}): string[] => {
  const worksIds: string[] = [];

  if (pipeDelimitedString && typeof pipeDelimitedString === 'string') {
    const parts = pipeDelimitedString.split('|');

    parts.forEach(part => {
      if (part && typeof part === 'string') {
        const match = part.trim().match(worksUrlPattern);
        if (match?.[1]) {
          worksIds.push(match[1]);
        }
      }
    });
  }

  return worksIds;
};

const extractWorksIdsFromTextSlice = ({
  slice,
}: {
  slice: TextSlice;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.text,
  });
};

const extractWorksIdsFromEditorialImageCaption = ({
  slice,
}: {
  slice: EditorialImageSlice;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.caption,
  });
};

const extractWorksIdsFromImageCopyright = ({
  slice,
}: {
  slice: EditorialImageSlice;
}): string[] => {
  return extractWorksIdsFromPipeDelimitedString({
    pipeDelimitedString: slice.primary.image.copyright,
  });
};

const extractWorksIdsFromGifVideoCaption = ({
  slice,
}: {
  slice: GifVideoSlice;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.caption,
  });
};

const extractWorksIdsFromGifVideoTasl = ({
  slice,
}: {
  slice: GifVideoSlice;
}): string[] => {
  return extractWorksIdsFromPipeDelimitedString({
    pipeDelimitedString: slice.primary.tasl,
  });
};

const extractWorksIdsFromEditorialImageGallery = ({
  slice,
}: {
  slice: EditorialImageGallerySlice;
}): string[] => {
  const worksIds: string[] = [];

  slice.items.forEach(item => {
    const copyrightIds = extractWorksIdsFromPipeDelimitedString({
      pipeDelimitedString: item.image.copyright,
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
        return extractWorksIdsFromTextSlice({ slice });
      case 'editorialImage':
        // We check copyright before caption to maintain the original order of the ids in the Prismic document.
        // This is important for the correct display of works in the frontend.
        return [
          ...extractWorksIdsFromImageCopyright({ slice }),
          ...extractWorksIdsFromEditorialImageCaption({
            slice,
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
          ...extractWorksIdsFromGifVideoCaption({ slice }),
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
