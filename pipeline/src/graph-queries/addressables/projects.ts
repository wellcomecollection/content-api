import { workLinksSlices } from './shared';

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
      ${workLinksSlices}
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
