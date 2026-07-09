import {
  editorialImageGallerySlice,
  editorialImageSlice,
  gifVideoSlice,
  standfirstSlice,
  textSlice,
} from './shared';

const query = `
  articles {
    title
    format {
      title
    }
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    body {
      ${textSlice}
      ${standfirstSlice}
      ${gifVideoSlice}
      ${editorialImageSlice}
      ${editorialImageGallerySlice}
    }
  }
`;

export default query;
