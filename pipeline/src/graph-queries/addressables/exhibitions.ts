import { editorialImageGallerySlice, textSlice } from './shared';

const query = `
  exhibitions {
    title
    body {
      ${textSlice}
      ${editorialImageGallerySlice}
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
