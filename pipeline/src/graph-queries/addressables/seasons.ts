import { workLinksSlices } from './shared';

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
      ${workLinksSlices}
      ...on standfirst {
        variation {
          ...on default {
            primary {
              text
            }
          }
        }
      }
    }
  }
`;

export default query;
