import {
  EditorialImageGallerySlice,
  EditorialImageSlice,
  GifVideoSlice,
  TextSlice,
} from '@weco/content-pipeline/src/types/prismic/prismicio-types';

const sharedImageProperties = {
  alt: 'alt text',
  copyright:
    'title | | Wellcome Collection | https://wellcomecollection.org/works/atrvxkxg/items | CC-BY | |',
  url: 'http://test.com/test.jpg',
  id: 'abcd1234abcd1234',
  edit: {
    x: 0,
    y: 0,
    zoom: 1,
    background: '#fff',
  },
};

const createImage = ({
  copyright = 'title | author | | | CC-BY-NC-ND | |',
}: {
  copyright?: string;
}) => ({
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
  url = 'http://test.com',
}: {
  url?: string;
}): TextSlice => ({
  id: '456def456',
  slice_type: 'text',
  slice_label: null,
  variation: 'default',
  version: 'initial',
  items: [],
  primary: {
    text: [
      {
        type: 'paragraph',
        text: 'Some text with a link',
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
  captionUrl = 'https://test.com',
  copyright = 'title | author | | | CC-BY-NC-ND | |',
}: {
  captionUrl?: string;
  copyright?: string;
}): EditorialImageSlice => ({
  id: '789abc789',
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
            text: 'Image caption with link',
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
    image: createImage({ copyright }),
    hasRoundedCorners: true,
  },
});

const sharedVideoProperties = {
  link_type: 'Media',
  key: '123',
  kind: 'file',
  id: '1011121314151617',
  url: 'https://test.com/video.mp4',
  name: 'video.mp4',
  size: '338305',
};

export const createGifVideoSlice = ({
  captionUrl = 'https://test.com',
  tasl = 'title | author | | | CC-BY | |',
}: {
  captionUrl?: string;
  tasl?: string;
}): GifVideoSlice =>
  ({
    variation: 'default',
    version: 'initial',
    items: [],
    primary: {
      caption: captionUrl
        ? [
            {
              type: 'paragraph',
              text: 'Video caption with link',
              spans: [
                {
                  type: 'hyperlink',
                  start: 18,
                  end: 22,
                  data: {
                    link_type: 'Web',
                    url: captionUrl,
                  },
                },
              ],
            },
          ]
        : [],
      tasl,
      video: sharedVideoProperties,
      playbackRate: null,
      autoPlay: true,
      loop: true,
      mute: true,
      showControls: false,
    },
    id: '9494858ujjfj',
    slice_type: 'gifVideo',
    slice_label: null,
  }) as GifVideoSlice;

export const createEditorialImageGallerySlice = ({
  items,
}: {
  items: {
    copyright?: string;
    captionUrl?: string;
  }[];
}): EditorialImageGallerySlice =>
  ({
    variation: 'default',
    version: 'initial',
    items: items.map(item => ({
      image: createImage({
        copyright: item.copyright || 'title | author | | | CC-BY | |',
      }),
      caption: item.captionUrl
        ? [
            {
              type: 'paragraph',
              text: 'Gallery image caption with link',
              spans: [
                {
                  type: 'hyperlink',
                  start: 14,
                  end: 20,
                  data: {
                    link_type: 'Web',
                    url: item.captionUrl,
                  },
                },
              ],
            },
          ]
        : [],
      hasRoundedCorners: false,
    })),
    primary: {
      title: [],
      isFrames: false,
    },
    id: 'editorialImageGallery123',
    slice_type: 'editorialImageGallery',
    slice_label: null,
  }) as EditorialImageGallerySlice;
