import { textSlice } from './shared';

const query = `
  events {
    title
    body {
      ${textSlice}
    }
    format {
      title
    }
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    times {
      startDateTime
      endDateTime
    }
    contributors {
      contributor {
        ...on people {
          name
        }
        ...on organisations {
          name
        }
      }
    }
  }`;

export default query;
