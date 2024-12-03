const query = `
  exhibition-highlight-tours {
    title
    related_exhibition {
      title
      promo {
        ...on editorialImage {
          non-repeat {
            caption
          }
        }
      }
    }
    intro_text
    slices {
      ...on guide_stop {
        variation {
          ...on default {
            primary {
              title
              transcript
              subtitles
            }
          }
        }
      }
    }
  }`;

export default query;
