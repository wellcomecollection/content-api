import {
  editorialImageGallerySlice,
  editorialImageSlice,
  textSlice,
} from './shared';

const query = `
  pages {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    introText
    body {
      ${textSlice}
      ${editorialImageSlice}
      ${editorialImageGallerySlice}
    }
  }
`;

export default query;
