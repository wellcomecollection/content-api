import { textSlice } from './shared';

const query = `
  books {
    title
    subtitle
    body {
      ${textSlice}
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
