import {
  EditorialImageSlice,
  TextSlice,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

const sharedImageProperties = {
  alt: 'alt text',
  copyright:
    'title | | Wellcome Collection | https://wellcomecollection.org/works/atrvxkxg/items | CC-BY | |',
  url: '/test.jpg',
  id: 'YJLi4hEAACAA6S7W',
  edit: {
    x: 0,
    y: 0,
    zoom: 1,
    background: '#fff',
  },
};

const createImage = (copyright: string) => ({
  dimensions: {
    width: 1668,
    height: 1334,
  },
  ...sharedImageProperties,
  copyright,
  '32:15': {
    dimensions: {
      width: 3200,
      height: 1500,
    },
    ...sharedImageProperties,
    copyright,
  },
  '16:9': {
    dimensions: {
      width: 3200,
      height: 1800,
    },
    ...sharedImageProperties,
    copyright,
  },
  square: {
    dimensions: {
      width: 3200,
      height: 3200,
    },
    ...sharedImageProperties,
    copyright,
  },
});

export const createTextSlice = ({
  url,
  text = 'Some text with a link',
}: {
  url: string;
  text?: string;
}): TextSlice => ({
  id: 'text$989a371a-df89-4d87-a2be-f76e4096ee9c',
  slice_type: 'text',
  slice_label: null,
  variation: 'default',
  version: 'initial',
  items: [],
  primary: {
    text: [
      {
        type: 'paragraph',
        text,
        spans: [
          {
            start: 16,
            end: 21,
            type: 'hyperlink',
            data: {
              link_type: 'Web',
              url,
            },
          },
        ],
      },
    ],
  },
});

export const createEditorialImageSlice = ({
  captionUrl,
  copyright = 'title | author | | | CC-BY-NC-ND | |',
  captionText = 'Image caption with link',
}: {
  captionUrl: string;
  copyright?: string;
  captionText?: string;
}): EditorialImageSlice => ({
  id: 'editorialImage$989a371a-df89-4d87-a2be-f76e4096ee9c',
  slice_type: 'editorialImage',
  slice_label: null,
  variation: 'default',
  version: 'initial',
  items: [],
  primary: {
    caption: captionUrl
      ? [
          {
            type: 'paragraph',
            text: captionText,
            spans: [
              {
                type: 'hyperlink',
                start: 20,
                end: 23,
                data: {
                  link_type: 'Web',
                  url: captionUrl,
                },
              },
            ],
          },
        ]
      : [],
    image: createImage(copyright),
    hasRoundedCorners: true,
  },
});
