import { standfirstSlice, textSlice } from './shared';

const query = `
  seasons {
    title
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
    }
  }
`;

export default query;
