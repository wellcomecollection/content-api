import { workLinksSlices } from './shared';

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
      ${workLinksSlices}
    }
  }
`;

export default query;
