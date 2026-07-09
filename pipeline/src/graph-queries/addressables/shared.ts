// Individual slice query fragments for extracting work links from body content.
// Each document type imports only the slices it supports.

export const textSlice = `
  ...on text {
    variation {
      ...on default {
        primary {
          text
        }
      }
    }
  }
`;

export const standfirstSlice = `
  ...on standfirst {
    variation {
      ...on default {
        primary {
          text
        }
      }
    }
  }
`;

export const editorialImageSlice = `
  ...on editorialImage {
    variation {
      ...on default {
        primary {
          image
          caption
        }
      }
    }
  }
`;

export const gifVideoSlice = `
  ...on gifVideo {
    variation {
      ...on default {
        primary {
          tasl
          caption
        }
      }
    }
  }
`;

export const editorialImageGallerySlice = `
  ...on editorialImageGallery {
    variation {
      ...on default {
        items {
          image
          caption
        }
      }
    }
  }
`;
