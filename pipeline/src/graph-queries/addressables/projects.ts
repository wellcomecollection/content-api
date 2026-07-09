import { editorialImageSlice, textSlice } from './shared';

const query = `
  projects {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    format {
      title
    }
    body {
      ${textSlice}
      ${editorialImageSlice}
    }
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }
`;

export default query;
