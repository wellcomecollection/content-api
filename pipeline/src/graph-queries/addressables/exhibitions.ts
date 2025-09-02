import { workLinksSlices } from './shared';

const query = `
  exhibitions {
    title
    body {
      ${workLinksSlices}
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
    start
    end
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }`;

export default query;
