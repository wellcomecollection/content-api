import { workLinksSlices } from './shared';

const query = `
  books {
    title
    subtitle
    body {
      ${workLinksSlices}
    }
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }`;

export default query;
