// This is what is needed to get all work links
export const workLinksSlices = `
  ...on text {
    variation {
      ...on default {
        primary {
          text
        }
      }
    }
  }
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
