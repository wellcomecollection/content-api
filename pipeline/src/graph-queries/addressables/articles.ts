import { workLinksSlices } from './shared';

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
