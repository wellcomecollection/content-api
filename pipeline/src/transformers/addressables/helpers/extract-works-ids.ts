import type * as prismic from '@prismicio/client';

import {
  EditorialImageGallerySlice,
  EditorialImageSlice,
  GifVideoSlice,
  TextSlice,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

export type AddressableSlicesWithPossibleWorks =
  | prismic.Content.ArticlesDocumentDataBodySlice
  | prismic.Content.BooksDocumentDataBodySlice
  | prismic.Content.PagesDocumentDataBodySlice
  | prismic.Content.ProjectsDocumentDataBodySlice
  | prismic.Content.SeasonsDocumentDataBodySlice;

// Helper functions for extracting Wellcome Collection work IDs from Prismic slice content.
// Searches for works URLs (https://wellcomecollection.org/works/[id]) in:
// - Text slices: hyperlinks in 'text' rich text field
// - Editorial image slices: hyperlinks in 'caption' rich text field, URLs in the image's copyright string
// - Editorial image gallery slices: hyperlinks in each item's 'caption' rich text field, URLs in each item's image copyright string
// - gifVideo slices: hyperlinks in 'caption' rich text field, URLs in the tasl string
const worksUrlPattern = /^https:\/\/wellcomecollection\.org\/works\/([^/?#]+)/i;

const extractWorksIdsFromRichTextField = ({
  richTextField,
  worksUrlPattern,
}: {
  richTextField: prismic.RichTextField;
  worksUrlPattern: RegExp;
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
  worksUrlPattern,
}: {
  pipeDelimitedString: string | null | undefined;
  worksUrlPattern: RegExp;
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
  worksUrlPattern,
}: {
  slice: TextSlice;
  worksUrlPattern: RegExp;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.text,
    worksUrlPattern,
  });
};

const extractWorksIdsFromEditorialImageCaption = ({
  slice,
  worksUrlPattern,
}: {
  slice: EditorialImageSlice;
  worksUrlPattern: RegExp;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.caption,
    worksUrlPattern,
  });
};

const extractWorksIdsFromImageCopyright = ({
  slice,
  worksUrlPattern,
}: {
  slice: EditorialImageSlice;
  worksUrlPattern: RegExp;
}): string[] => {
  return extractWorksIdsFromPipeDelimitedString({
    pipeDelimitedString: slice.primary.image.copyright,
    worksUrlPattern,
  });
};

const extractWorksIdsFromGifVideoCaption = ({
  slice,
  worksUrlPattern,
}: {
  slice: GifVideoSlice;
  worksUrlPattern: RegExp;
}): string[] => {
  return extractWorksIdsFromRichTextField({
    richTextField: slice.primary.caption,
    worksUrlPattern,
  });
};

const extractWorksIdsFromGifVideoTasl = ({
  slice,
  worksUrlPattern,
}: {
  slice: GifVideoSlice;
  worksUrlPattern: RegExp;
}): string[] => {
  return extractWorksIdsFromPipeDelimitedString({
    pipeDelimitedString: slice.primary.tasl,
    worksUrlPattern,
  });
};

const extractWorksIdsFromEditorialImageGallery = ({
  slice,
  worksUrlPattern,
}: {
  slice: EditorialImageGallerySlice;
  worksUrlPattern: RegExp;
}): string[] => {
  const worksIds: string[] = [];

  slice.items.forEach(item => {
    const copyrightIds = extractWorksIdsFromPipeDelimitedString({
      pipeDelimitedString: item.image.copyright,
      worksUrlPattern,
    });
    worksIds.push(...copyrightIds);

    const captionIds = extractWorksIdsFromRichTextField({
      richTextField: item.caption,
      worksUrlPattern,
    });
    worksIds.push(...captionIds);
  });

  return worksIds;
};

const extractWorksIdsFromSlices = (
  slices: AddressableSlicesWithPossibleWorks[]
): string[] => {
  const worksIds = slices.flatMap(slice => {
    switch (slice.slice_type) {
      case 'text':
        return extractWorksIdsFromTextSlice({ slice, worksUrlPattern });
      case 'editorialImage':
        // We check copyright before caption to maintain the correct order
        return [
          ...extractWorksIdsFromImageCopyright({ slice, worksUrlPattern }),
          ...extractWorksIdsFromEditorialImageCaption({
            slice,
            worksUrlPattern,
          }),
        ];
      case 'editorialImageGallery':
        return extractWorksIdsFromEditorialImageGallery({
          slice,
          worksUrlPattern,
        });
      case 'gifVideo':
        // We check tasl before caption to maintain the correct order
        return [
          ...extractWorksIdsFromGifVideoTasl({ slice, worksUrlPattern }),
          ...extractWorksIdsFromGifVideoCaption({ slice, worksUrlPattern }),
        ];
      default:
        return [];
    }
  });

  // Return deduplicated array
  return [...new Set(worksIds)];
};

export const getWorksIdsFromDocumentBody = (
  documentBody: AddressableSlicesWithPossibleWorks[]
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
